import { useVote } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

export default function ReadyProposals() {
  const voteContract = useVote(process.env.REACT_APP_VOTE_CONTRACT);
  const [execProposals, setExecProposals] = useState([]);

  useEffect(() => {
    (async () => {
      const allProposals = await voteContract.getAll();
      setExecProposals(allProposals.filter((proposal) => proposal.state === 4));
    })();
  }, []);

  const executeProposal = (id: string, index: number) => {
    voteContract.execute(id);
    setExecProposals(execProposals.slice().splice(index, 1));
  };

  return (
    <>
      {execProposals.length ? (
        <div className="flex-box">
          <p>Ready to execute proposals</p>
          <div className="card">
            {execProposals.map((proposal, index) => {
              return (
                <div>
                  <p>{proposal.description}</p>
                  <button
                    className={"exec-button"}
                    onClick={() => {
                      executeProposal(proposal.proposalId.toString(), index);
                    }}
                  >
                    Execute
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
