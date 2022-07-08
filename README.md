# On-chain DAO

This is a DegenDAO, where members can know about some upcoming shitty nft mints; put thier funds in the pool to buy a top blue-chip nft just for flip following any influencers' insides. Users can access DAO by holding a NFT membership pass(ERC-1155), which users can mint on the website. As usual there is a governance token $DEGEN used for voting in proposals.

## On-chain DAO pool

To be added

# Deploy

1. Setup `.env` file, see `.env.example`. Leave last three vars blank, you will set up it after deploying contracts.
2. Run `npm run deploy` to deploy Nft membership pass, governance token and voting contracts. You can also configure them in `deploy.ts` and `scripts.ts` at `src/utils/`. **Set up last blank env vars after deploying.**
3. To mint more tokens: input amount in `src/utils/mint.ts` and run `npm run mint`.
4. To airdrop tokens to DAO members: input amount in `src/utils/airdrop.ts` and run `npm run airdrop`.
