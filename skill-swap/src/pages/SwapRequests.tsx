import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSkillSwapsForUser,
  updateSwapStatus,
} from "../api/skillSwapService";
import { useAuth } from "../store/hooks";
import "../SwapRequests.css";

interface SwapRequest {
  id: string;
  status: string;
  requester: { name: string; profilePictureUrl: string | null };
  targetUser: { name: string; profilePictureUrl: string | null };
  offeredSkill: { skill: { skillName: string } };
  targetSkill:  { skill: { skillName: string } };
}

export default function SwapRequests() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useAuth();
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<SwapRequest[]>([]);
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [acceptedMsg, setAcceptedMsg] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!currentUser?.id) return;
    (async () => {
      try {
        setLoading(true);
        const raw = await getSkillSwapsForUser(currentUser.id);
        const { incoming: inc = [], outgoing: out = [] } = raw;
        // Accepted requests from both incoming and outgoing
        setAccepted([
          ...inc.filter((r: any) => r.status === "Accepted"),
          ...out.filter((r: any) => r.status === "Accepted"),
        ]);
        setIncoming(inc.filter((r: any) => r.status !== "Accepted"));
        setOutgoing(out.filter((r: any) => r.status !== "Accepted"));
      } catch (err) {
        console.error("Failed to fetch swap requests:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser?.id]);

  const handleStatus = async (id: string, status: "Accepted" | "Declined" | "N/A") => {
    try {
      await updateSwapStatus(id, status);
      // Re-fetch all swap requests to ensure UI is in sync with backend
      if (!currentUser?.id) return;
      setLoading(true);
      const raw = await getSkillSwapsForUser(currentUser.id);
      const { incoming: inc = [], outgoing: out = [] } = raw;
      setAccepted([
        ...inc.filter((r: any) => r.status === "Accepted"),
        ...out.filter((r: any) => r.status === "Accepted"),
      ]);
      setIncoming(inc.filter((r: any) => r.status !== "Accepted"));
      setOutgoing(out.filter((r: any) => r.status !== "Accepted"));
      setLoading(false);
      if (status === "Accepted") {
        setShowAcceptedPopup(true);
        setAcceptedMsg("Swap request accepted!");
        setTimeout(() => setShowAcceptedPopup(false), 2000);
      }
    } catch (err) {
      setLoading(false);
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return <p style={{ padding: "1rem" }}>Loading requests…</p>;

  return (
    <div className="swap-requests-3col">
      {showAcceptedPopup && (
        <div className="accepted-popup">{acceptedMsg}</div>
      )}
      <div className="column">
        <h2>Incoming</h2>
        {incoming.length === 0 && <p>No one has requested a swap yet.</p>}
        {incoming.map((req) => (
          <RequestCard key={req.id} req={req} type="incoming" onStatus={handleStatus} />
        ))}
      </div>
      <div className="column">
        <h2>Outgoing</h2>
        {outgoing.length === 0 && <p>You haven’t requested any swaps yet.</p>}
        {outgoing.map((req) => (
          <RequestCard key={req.id} req={req} type="outgoing" onStatus={handleStatus} />
        ))}
      </div>
      <div className="column">
        <h2>Accepted</h2>
        {accepted.length === 0 && <p>No accepted swaps yet.</p>}
        {accepted.map((req) => (
          <RequestCard key={req.id} req={req} type="accepted" onStatus={handleStatus} />
        ))}
      </div>
    </div>
  );
}

function RequestCard({ req, type, onStatus }: { req: SwapRequest, type: string, onStatus: (id: string, status: "Accepted" | "Declined" | "N/A") => void }) {
  const isIncoming = type === "incoming";
  const isOutgoing = type === "outgoing";
  const isAccepted = req.status === "Accepted";
  const isDeclined = req.status === "Declined";

  return (
    <div className={`request-card ${type} ${isAccepted ? "accepted" : ""} ${isDeclined ? "declined" : ""}`}> 
      <img
        src={isIncoming ? (req.requester.profilePictureUrl ?? "/default_pfp.jpg") : (req.targetUser.profilePictureUrl ?? "/default_pfp.jpg")}
        alt={isIncoming ? req.requester.name : req.targetUser.name}
        className="avatar"
      />
      <div className="body">
        <h4>
          {isIncoming
            ? <>{req.requester.name} wants to learn <strong>{req.targetSkill.skill.skillName}</strong> from you</>
            : isOutgoing
              ? <>You asked {req.targetUser.name} to teach you <strong>{req.targetSkill.skill.skillName}</strong></>
              : isAccepted && isIncoming
                ? <>{req.requester.name} swap accepted!</>
                : <>Swap accepted with {req.targetUser.name}</>
          }
        </h4>
        <div className="swap-skills-info">
          <span className="swap-skill-label">Requested Skill:</span> <strong>{req.targetSkill.skill.skillName}</strong><br />
          <span className="swap-skill-label">Offered Skill:</span> <strong>{req.offeredSkill.skill.skillName}</strong>
        </div>
        {/* Only show Accept/Decline for incoming requests that are not accepted */}
        {isIncoming && !isAccepted && (
          <div className="buttons-row">
            <button className="accept-btn" onClick={() => onStatus(req.id, "Accepted")}>Accept</button>
            <button className="decline-btn" onClick={() => onStatus(req.id, "Declined")}>Decline</button>
          </div>
        )}
        <span className={`status ${req.status.toLowerCase()}`}>{req.status}</span>
      </div>
    </div>
  );
}
