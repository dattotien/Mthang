import "./VideoOverlay.css"

interface ClinicalInfo {
  ID: string
  Age: number
  BMI: number
  Date: string
}

interface VideoOverlayProps {
  info: {
    procedure: string
    phases: string[]
    current_phase: string
    time_to_next_phase: string
    confidence: string
    clinical_info: ClinicalInfo
  }
  videoSrc?: string // optional video source
}

function CircleBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="circle-box">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

export default function VideoOverlay({ info, videoSrc }: VideoOverlayProps) {
  return (
    <div className="video-container">
      {/* Video in circular frame */}
      <div className="video-frame">
        <svg className="oval-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <clipPath id="ovalClip">
              <ellipse cx="50" cy="50" rx="50" ry="38" />
            </clipPath>
          </defs>
          {videoSrc ? (
            <foreignObject x="0" y="0" width="100" height="100" clipPath="url(#ovalClip)">
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </foreignObject>
          ) : (
            <image
              href="/placeholder-frame.jpg"
              x="0" y="0" width="100" height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#ovalClip)"
            />
          )}
        </svg>
      </div>


      {/* Overlay information */}
      <div className="video-overlay">
        <div className="overlay-left">
          <h2>PROCEDURE: {info.procedure.toUpperCase()}</h2>

          <div className="phase-list">
            {info.phases.map((p, i) => (
              <div key={i} className={`phase-item ${p === info.current_phase ? "active" : ""}`}>
                {p}
              </div>
            ))}
          </div>

          <CircleBox title="Time to next phase" value={info.time_to_next_phase} />
          <CircleBox title="Confidence" value={info.confidence} />

          <div className="current-phase">
            <b>CURRENT PHASE:</b> {info.current_phase}
          </div>
        </div>

        <div className="overlay-right">
          <h2>CLINICAL INFO</h2>
          <p>ID: {info.clinical_info.ID}</p>
          <p>Age: {info.clinical_info.Age}</p>
          <p>BMI: {info.clinical_info.BMI}</p>
          <p>Date: {info.clinical_info.Date}</p>
        </div>

        <div className="overlay-brand">
          <h3>AURELIA OR</h3>
        </div>
      </div>
    </div>
  )
}
