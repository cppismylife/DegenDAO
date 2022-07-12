import { useState, useEffect, useMemo } from "react";
import { EditionDrop, Token } from "@thirdweb-dev/sdk";

export default function HoldersList(props: {
  token: Token;
  editionDrop: EditionDrop;
}) {
  const editionDrop = props.editionDrop;
  const token = props.token;

  const [holders, updateHolders] = useState([]);

  useEffect(() => {
    (async () => {
      updateHolders(await sortedHolders);
    })();
  }, []);

  const sortedHolders = useMemo(async () => {
    const tokenHolders = await token.history.getAllHolderBalances();
    tokenHolders?.sort((a, b) => {
      if (b.balance.value.gt(a.balance.value)) return 1;
      else if (a.balance.value.gt(b.balance.value)) return -1;
      else return 0;
    });
    let topHolders = [];
    for (
      let i = tokenHolders?.length - 1;
      i >= 0 && topHolders?.length < 5;
      --i
    ) {
      const wallet = tokenHolders[i];
      if (await editionDrop.balanceOf(wallet.holder, 0))
        topHolders.push({
          address: wallet.holder,
          balance: wallet.balance.displayValue,
        });
    }
    return topHolders.reverse();
  }, [token, editionDrop]);

  const cutAddress = (address: string) => {
    return address?.slice(0, 6) + "..." + address.slice(address.length - 6);
  };

  return (
    <div className="flex-box">
      <p>Top-5 $DEGEN holders in DegenDAO</p>
      <div
        className="card flex-box"
        style={{ width: "100%", boxSizing: "border-box" }}
      >
        <table className="holders-table">
          <thead>
            <tr>
              <td>Address</td>
              <td>Amount</td>
            </tr>
          </thead>
          <tbody>
            {holders.length ? (
              holders.map((holder) => {
                return (
                  <tr key={holder?.address}>
                    <td>
                      <a
                        className={"address-link"}
                        href={`https://rinkeby.etherscan.io/address/${holder?.address}`}
                      >
                        {cutAddress(holder?.address)}
                      </a>
                    </td>
                    <td>{holder?.balance}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>Fetching data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
