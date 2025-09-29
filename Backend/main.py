from fastapi import FastAPI, Query, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import pandas as pd
import random
import os

app = FastAPI()

# CORS để frontend gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load data ---
annotations = pd.read_csv("data/annotations.csv", sep=";")
phases = pd.read_csv("data/phases.csv", sep=";")

# Merge để annotations có cột Meaning
annotations = annotations.merge(phases, on="Phase")

# Clinical info mẫu
clinical_info = {
    "ID": "230236XX",
    "Age": 36,
    "BMI": 27,
    "Date": "2025-11-01"
}

# --- Info endpoint (như trước) ---
@app.get("/info")
def get_info(frame: int = Query(..., description="Current frame index"), video_id: int = 269):
    """
    Trả thông tin overlay tại frame hiện tại
    """
    # Lọc annotation theo video_id
    df = annotations[annotations["VideoID"] == video_id].sort_values("FrameNo").reset_index(drop=True)

    if df.empty:
        raise HTTPException(status_code=404, detail="No annotations for this video_id")

    # Danh sách phases (Meaning) cho video này
    phases_list = [f"P{int(row.Phase)} - {row.Meaning}" for _, row in df.iterrows()]

    # Tìm phase hiện tại (frame gần nhất <= frame input)
    current = df[df["FrameNo"] <= frame].tail(1)
    if current.empty:
        # Frame trước phase đầu tiên
        return {
            "procedure": "Cholecystectomy",
            "phases": phases_list,
            "current_phase": None,
            "time_to_next_phase": None,
            "confidence": "100.0%",
            "clinical_info": clinical_info
        }

    # current_phase
    current_phase = current.iloc[0]
    current_idx = current.index[0]

    # Tìm phase tiếp theo
    if current_idx + 1 < len(df):
        next_phase = df.iloc[current_idx + 1]
        frames_to_next = next_phase["FrameNo"] - frame
        fps = 25  # hardcode, có thể lấy từ video_info
        seconds_to_next = max(0, frames_to_next) / fps
    else:
        seconds_to_next = 0

    # Format time mm:ss
    mm = int(seconds_to_next // 60)
    ss = int(seconds_to_next % 60)
    time_str = f"{mm:02d}:{ss:02d}"

    return {
        "procedure": "Cholecystectomy",
        "phases": phases_list,
        "current_phase": f"P{int(current_phase['Phase'])} - {current_phase['Meaning']}",
        "time_to_next_phase": time_str,
        "confidence": f"{random.uniform(95, 99):.1f}%",
        "clinical_info": clinical_info
    }


# --- Video streaming endpoint with Range support ---
def _get_video_path(video_id: int):
    # File layout: videos/case_<id>.mp4
    return os.path.join("videos", f"case_{video_id}.mp4")


@app.get("/video")
def stream_video(request: Request, video_id: int = 269):
    """
    Stream video with Range header support so browser can seek.
    Usage: GET /video?video_id=269
    """
    video_path = _get_video_path(video_id)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video not found: {video_path}")

    file_size = os.path.getsize(video_path)
    range_header = request.headers.get("range")

    if not range_header:
        # No range header — serve whole file
        return FileResponse(video_path, media_type="video/mp4")

    # Parse Range header: "bytes=start-end"
    # Example: "bytes=12345-"
    range_val = range_header.strip().lower()
    if not range_val.startswith("bytes="):
        raise HTTPException(status_code=400, detail="Invalid Range header")

    range_val = range_val.split("=", 1)[1]
    start_str, end_str = range_val.split("-")
    try:
        start = int(start_str) if start_str else 0
    except ValueError:
        start = 0
    try:
        end = int(end_str) if end_str else file_size - 1
    except ValueError:
        end = file_size - 1

    if start >= file_size:
        raise HTTPException(status_code=416, detail="Requested Range Not Satisfiable")

    if end >= file_size:
        end = file_size - 1

    chunk_size = 1024 * 1024  # 1MB per chunk

    def iter_file(path: str, start_byte: int, end_byte: int):
        with open(path, "rb") as f:
            f.seek(start_byte)
            bytes_left = end_byte - start_byte + 1
            while bytes_left > 0:
                read_len = min(chunk_size, bytes_left)
                data = f.read(read_len)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
        "Content-Type": "video/mp4",
    }

    return StreamingResponse(iter_file(video_path, start, end), status_code=206, headers=headers, media_type="video/mp4")
