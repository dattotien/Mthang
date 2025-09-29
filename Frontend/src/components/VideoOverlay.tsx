import React from "react";

interface ClinicalInfo {
  ID: string;
  Age: number;
  BMI: number;
  Date: string;
}

interface VideoOverlayProps {
  info: {
    procedure: string;
    phases: string[];
    current_phase: string;
    time_to_next_phase: string;
    confidence: string;
    clinical_info: ClinicalInfo;
  };
}

function CircleBox({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        border: "2px solid #00e5ff",
        borderRadius: "50%",
        width: "140px",
        height: "140px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "20px 0",
        textAlign: "center",
        background: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <p style={{ fontSize: "13px", margin: "0", color: "#ccc" }}>{title}</p>
      <h2 style={{ margin: "5px 0 0 0", fontSize: "20px", color: "white" }}>
        {value}
      </h2>
    </div>
  );
}

function VideoOverlay({ info }: VideoOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        color: "white",
        fontFamily: "Arial, sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Left side */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        {/* Procedure */}
        <h2 style={{ marginBottom: "10px", color: "#00e5ff" }}>
          PROCEDURE: {info.procedure.toUpperCase()}
        </h2>

        {/* Phases */}
        <div
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            marginBottom: "15px",
          }}
        >
          {info.phases.map((p, idx) => (
            <div
              key={idx}
              style={{
                fontWeight: p === info.current_phase ? "bold" : "normal",
                color: p === info.current_phase ? "#00e5ff" : "#fff",
              }}
            >
              P{idx + 1}: {p}
            </div>
          ))}
        </div>

        {/* Circles */}
        <CircleBox title="Time to next phase" value={info.time_to_next_phase} />
        <CircleBox title="Confidence" value={info.confidence} />

        {/* Current Phase */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid #00e5ff",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          <b style={{ fontSize: "16px", color: "#00e5ff" }}>CURRENT PHASE:</b>{" "}
          <span style={{ fontSize: "16px" }}>{info.current_phase}</span>
        </div>
      </div>

      {/* Right side */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          textAlign: "right",
          background: "rgba(0,0,0,0.5)",
          padding: "10px 15px",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", color: "#00e5ff" }}>
          CLINICAL INFO
        </h2>
        <p style={{ margin: 0 }}>ID: {info.clinical_info.ID}</p>
        <p style={{ margin: 0 }}>Age: {info.clinical_info.Age}</p>
        <p style={{ margin: 0 }}>BMI: {info.clinical_info.BMI}</p>
        <p style={{ margin: 0 }}>Date: {info.clinical_info.Date}</p>
      </div>

      {/* Bottom right branding */}
      <div style={{ position: "absolute", bottom: 20, right: 20 }}>
        <h3 style={{ margin: 0, color: "#00e5ff" }}>AURELIA OR</h3>
      </div>
    </div>
  );
}

export default VideoOverlay;
