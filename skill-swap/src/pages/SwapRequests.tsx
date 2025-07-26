import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSkillSwapsForUser,
  updateSwapStatus,
} from "../api/skillSwapService";
import { useAuth } from
 "../store/hooks";
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
  
  // Redux hooks - get user data from store (no API call needed!)
  const { currentUser, isLoggedIn } = useAuth();
  
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log("SwapRequests - Redux user:", currentUser);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [isLoggedIn, navigate]);

  // Fetch swap requests using Redux user data (much simpler!)
  useEffect(() => {
    if (!currentUser?.id) return;
    
    (async () => {
      try {
        setLoading(true);
        
        // Direct API call with database user ID from Redux!
        const raw = await getSkillSwapsForUser(currentUser.id);
        const { incoming: inc = [], outgoing: out = [] } = raw;

        setIncoming(inc);
        setOutgoing(out);
      } catch (err) {
        console.error("Failed to fetch swap requests:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser?.id]);

  const handleStatus = async (id: string, status: "Accepted" | "Declined") => {
    try {
      await updateSwapStatus(id, status);
      // optimistic UI update
      setIncoming((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return <p style={{ padding: "1rem" }}>Loading requests…</p>;

  return (
    <div className="swap-requests-page">
      <h2>Incoming Requests</h2>
      {incoming.length === 0 && <p>No one has requested a swap yet.</p>}
      {incoming.map((req) => (
        <div key={req.id} className="request-card">
          <img
            src={req.requester.profilePictureUrl ?? "/default_pfp.jpg"}
            alt={req.requester.name}
          />
          <div className="body">
            <h4>
              {req.requester.name} wants to learn{" "}
              <strong>{req.targetSkill.skill.skillName}</strong> from you
            </h4>
            <p>
              They’ll teach you{" "}
              <strong>{req.offeredSkill.skill.skillName}</strong>.
            </p>

            {req.status === "N/A" ? (
              <div className="buttons">
                <button onClick={() => handleStatus(req.id, "Accepted")}>
                  Accept
                </button>
                <button onClick={() => handleStatus(req.id, "Declined")}>
                  Decline
                </button>
              </div>
            ) : (
              <span className={`status ${req.status.toLowerCase()}`}>
                {req.status}
              </span>
            )}
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: "2rem" }}>Outgoing Requests</h2>
      {outgoing.length === 0 && <p>You haven’t requested any swaps yet.</p>}
      {outgoing.map((req) => (
        <div key={req.id} className="request-card">
          <img
            src={req.targetUser.profilePictureUrl ?? "/default_pfp.jpg"}
            alt={req.targetUser.name}
          />
          <div className="body">
            <h4>
              You asked {req.targetUser.name} to teach you{" "}
              <strong>{req.targetSkill.skill.skillName}</strong>
            </h4>
            <p>
              In return you’ll teach{" "}
              <strong>{req.offeredSkill.skill.skillName}</strong>.
            </p>
            <span className={`status ${req.status.toLowerCase()}`}>
              {req.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
