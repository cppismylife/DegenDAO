import { useVote, useAddress, useToken } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Vote() {
  const voteContract = useVote(process.env.REACT_APP_VOTE_CONTRACT);
  const tokenContract = useToken(process.env.REACT_APP_TOKEN_CONTRACT);
  const address = useAddress();
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    (async () => {
      const allProposals = await voteContract.getAll();
      const didntVoted = await Promise.all(
        allProposals.map(async (proposal) => {
          const hasVoted = await voteContract.hasVoted(
            proposal.proposalId.toString(),
            address
          );
          if (!hasVoted && proposal.state === 1) return proposal;
        })
      );
      setProposals(didntVoted.filter((proposal) => proposal));
    })();
  }, []);

  const submitVote = async (
    proposalId: string,
    voteType: number,
    proposalsStateIndex: number
  ) => {
    try {
      const delgation = await tokenContract.getDelegationOf(address);
      if (delgation === ethers.constants.AddressZero)
        await tokenContract.delegateTo(address);
      await voteContract.vote(proposalId, voteType);
      console.log("Successfuly voted!");
      let updatedProposals = proposals.slice();
      updatedProposals.splice(proposalsStateIndex, 1);
      setProposals(updatedProposals);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-box" style={{ marginLeft: "35px" }}>
      <p>Ongoing proposals</p>
      {proposals.length ? (
        proposals.map((proposal, index) => {
          return (
            <div className="proposal card" key={index}>
              <p className="proposal-description">{proposal?.description}</p>
              <div className="flex-buttons">
                {proposal?.votes.map(({ label, type }) => {
                  return (
                    <button
                      key={type}
                      className="vote-button"
                      onClick={() => {
                        submitVote(
                          proposal?.proposalId.toString(),
                          type,
                          index
                        );
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="proposal card">
          <p className="proposal-description">
            There is no any active proposals or you have already voted in them.
          </p>
        </div>
      )}
    </div>
  );
}
