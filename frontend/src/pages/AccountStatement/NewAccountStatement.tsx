import moment from "moment";
import React, { MouseEvent, useState } from "react";
// import ReactPaginate from 'react-paginate'
import { toast } from "react-toastify";
import accountService from "../../services/account.service";
import { dateFormat } from "../../utils/helper";
import { isMobile } from "react-device-detect";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import { AccoutStatement } from "../../models/AccountStatement";
import { AxiosResponse } from "axios";
import betService from "../../services/bet.service";
import ReactModal from "react-modal";
import BetListComponent from "../../admin-app/pages/UnsetteleBetHistory/bet-list.component";
import { useAppSelector } from "../../redux/hooks";
import { selectLoader } from "../../redux/actions/common/commonSlice";
import ReactPaginate from "react-paginate";

import "./newaccount.css";
import { reverse } from "lodash";

const NewAccountStatement = () => {
  const loadingState = useAppSelector(selectLoader);

  const [accountStmt, setAccountStmt] = React.useState<any>([]);
  const [parseAccountStmt, setparseAccountStmt] = React.useState<any>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [betHistory, setBetHistory] = React.useState<any>({});
  const [selectedStmt, setSelectedStmt] = React.useState<AccoutStatement>(
    {} as AccoutStatement
  );
  const [pageBet, setPageBet] = React.useState(1);
  const [openBalance, setOpenBalance] = React.useState(0);
  const [closeBalance, setCloseBalance] = React.useState(0);
  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: "",
    endDate: "",
    reportType: "All",
  });
  const [page, setPage] = React.useState(0);

  const [currentItems, setCurrentItems] = useState<any>([]);
  const [pageCount, setPageCount] = useState<any>(1);
  const [itemsPerPage] = useState(50);
  // React.useEffect(() => {
  //   const filterObj = filterdata;
  //   filterObj.startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
  //   filterObj.endDate = moment().format("YYYY-MM-DD");
  //   setfilterdata(filterObj);
  //   getAccountStmt(0);
  // }, []);

  // React.useEffect(() => {
  //   const endOffset = itemOffset + itemsPerPage;
  //   setCurrentItems(parseAccountStmt.slice(itemOffset, endOffset));
  //   setPageCount(Math.ceil(parseAccountStmt.length / itemsPerPage));
  // }, [itemOffset, itemsPerPage, parseAccountStmt]);

  React.useEffect(() => {
  const filterObj = {
    ...filterdata,
    startDate: moment().subtract(3, "months").format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
  };

  setfilterdata(filterObj);
  // getAccountStmt(1);
}, []);

React.useEffect(() => {
  if (filterdata.startDate && filterdata.endDate) {
    getAccountStmt(1);
  }
}, [filterdata]);

const handlePageClick = (event: any) => {
  const selectedPage = event.selected + 1;
  getAccountStmt(selectedPage);
};
const getAccountStmt = async (pageNumber: number) => {
  try {
    const res = await accountService.getAccountList(pageNumber, filterdata);

    const items = res?.data?.data?.items || [];
    const opening = res?.data?.data?.openingBalance || 0;
    const total = res?.data?.data?.total || 0;

    let baseBalance = opening;

    // 🔥 previous pages ka balance calculate
    if (pageNumber > 1) {
      let prevSum = 0;

      for (let i = 1; i < pageNumber; i++) {
        const prevRes = await accountService.getAccountList(i, filterdata);
        const prevItems = prevRes?.data?.data?.items || [];

        prevSum += prevItems.reduce(
          (acc: number, curr: any) => acc + curr.amount,
          0
        );
      }

      baseBalance = opening + prevSum;
    }

    const formatted = dataformat(items, baseBalance);

    setCurrentItems(formatted);
    setOpenBalance(opening);
    setPage(pageNumber);
    setPageCount(Math.ceil(total / itemsPerPage));
  } catch (e) {
    toast.error("error");
  }
};
  const handleformchange = (event: any) => {
    const filterObj = filterdata;
    filterObj[event.target.name] = event.target.value;
    setfilterdata(filterObj);
  };
  // const handleSubmitform = (event: any) => {
  //   event.preventDefault();
  //   getAccountStmt(0);
  // };

  const createSrNo = (index: number) => {
    return (page - 1) * itemsPerPage || 0 + index + 1;
  };

  const handlePageClickBets = (event: any) => {
    getBetsData(selectedStmt, event.selected + 1);
  };

  React.useEffect(() => {
    if (isOpen) getBetsData(selectedStmt, pageBet);
  }, [selectedStmt, pageBet, isOpen]);

  const getBetsData = (stmt: any, pageNumber: number) => {
    const allBetsid: any = [];
    const allbets = stmt?.allBets || [];
    if (allbets.length > 0) {
      allbets.map((Item: any) => {
        allBetsid.push(Item.betId);
      });
      const betIds = allBetsid;
      betService
        .getBetListByIds(betIds, pageNumber)
        .then((res: AxiosResponse) => {
          setBetHistory(res.data.data);
          setPageBet(pageNumber);
        });
    }
  };
  const getBets = (
    e: MouseEvent<HTMLTableCellElement>,
    stmt: AccoutStatement
  ) => {
    e.preventDefault();
    setSelectedStmt(stmt);
    setPageBet(1);
    setIsOpen(true);
  };
 

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const getAcHtml = () => {
    let grouped: any = {};
    //console.log(currentItems, "drrerer");

    currentItems?.forEach((stmt: any) => {
      if (!stmt?.narration || !stmt?.stmt?.allBets) return;

      const gameName = stmt.narration.split(" /")[0]?.trim();
      const rawDate = moment(stmt.date, "MMM DD, YYYY hh:mm A").format(
        "YYYY-MM-DD"
      );

      if (!grouped[gameName]) grouped[gameName] = {};
      if (!grouped[gameName][rawDate]) grouped[gameName][rawDate] = [];

      grouped[gameName][rawDate].push(stmt);
    });

    // Render grouped table
    const tableRows: any[] = [];
    let runningBalance = 0;

    // Sort the groups for chronological balance tracking
    const sortedEntries = Object.entries(grouped)
      .flatMap(([gameName, dates]: any) => {
        return Object.entries(dates).map(([date, stmts]: any) => ({
          gameName,
          date,
          stmts,
          sortDate: moment(date).format("YYYY-MM-DD"), // for sorting
        }));
      })
      .sort((a, b) => moment(a.sortDate).diff(moment(b.sortDate)));

    sortedEntries.forEach(({ gameName, date, stmts }) => {
      let totalCredit = 0;
      let totalDebit = 0;

      stmts.forEach((stmt: any) => {
        totalCredit += stmt.credit;
        totalDebit += stmt.credit;
      });

      runningBalance += totalCredit;

      tableRows.unshift(
        <tr key={`${gameName}-${date}`}>
          <td
            className="custom-link"
            onClick={() => setSelectedGroup(gameName + date)}
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
          >
            {gameName}({date})
          </td>
          <td>
            <span
              className="badge badge-primary p-1 ng-binding"
              style={{ fontSize: "xx-small" }}
            >
              <i style={{ fontSize: "10px" }} className="fas fa-trophy"></i> N/A
            </span>
          </td>
          <td className="green">
            {totalCredit >= 0 ? totalCredit.toFixed(2) : "0.00"}
          </td>
          <td className="red">
            {totalDebit < 0 ? totalDebit.toFixed(2) : "0.00"}
          </td>
          <td className={runningBalance >= 0 ? "green" : "green"}>
            {runningBalance.toFixed(2)}
          </td>
        </tr>
      );
    });

    return tableRows;
  };

  const getAcHtml22 = () => {
    let closingbalance: number = page === 1 ? openBalance : closeBalance;

    let totalPnl = 0;

    // Extract gameName and date from narration and filter
    // console.log(currentItems,"current Item,")
    const filteredItems = currentItems?.filter((stmt: any) => {
      if (!stmt?.narration) return false;
      const gameName = stmt.narration.split(" /")[0]?.trim();
      const rawDate = moment(stmt.date, "MMM DD, YYYY hh:mm A").format(
        "YYYY-MM-DD"
      );
      return selectedGroup === gameName + rawDate;
    });

    const rows = filteredItems?.map((stmtt: any, index: number) => {
      console.log("stmt",stmtt?.stmt.allBets[0])
      closingbalance = closingbalance + stmtt.amount;

      const pnlString = stmtt?.credit;
      const pnl = parseFloat(pnlString) || 0;
      totalPnl += pnl;

      if (stmtt.narration.length === 0) return null;

      //console.log(filteredItems, "filtered itemss");

      return (
        <tr key={`${stmtt._id}${index}`}>
          <td>
            {stmtt?.stmt?.allBets ?  stmtt?.stmt.allBets[0].narration : stmtt?.stmt.allBets[0].narration}
          </td>
          <td>
            {stmtt?.stmt.allBets[0]?.result?.marketName
              ? stmtt?.stmt.allBets[0]?.result?.marketName
              : stmtt?.stmt.allBets[0]?.result?.selectionId
}
          </td>
          <td>
            {stmtt?.stmt?.allBets ? stmtt?.stmt?.allBets[0]?.result?.odds : ""}
          </td>
          <td>
            {stmtt.stmt?.allBets
              ? stmtt.stmt.allBets.reduce((sum: number, bet: any) => {
                  const stack = parseFloat(bet?.result?.stack) || bet?.result?.betamount;
                  return sum + stack;
                }, 0)
              : ""}
          </td>

          <td>
            {stmtt?.stmt?.allBets[0]
              ? stmtt?.stmt.allBets[0].narration?.match(/,([^[]+)\[/)?.[1]?.trim()
              : ""}
          </td>
          <td>
            {stmtt?.stmt?.allBets[0]
              ? stmtt?.stmt.allBets[0].narration?.match(/winner:\s*([^,\[\]]+)?/)?.[1]?.trim()
              : ""}
          </td>
          <td>{stmtt?.stmt?.allBets ? stmtt?.credit : ""}</td>
          <td className="green wnwrap d-none">
            {stmtt?.stmt?.allBets ? stmtt.closing : ""}
          </td>
        </tr>
      );
    });

    return (
      <>
        {rows}
        <tr>
          <td colSpan={8}>
            <strong className={`${totalPnl < 0 ? "total2" : "total"}`}>
              You {totalPnl < 0 ? "lost" : "won"} {totalPnl.toFixed(2)} coins
            </strong>
          </td>
        </tr>
      </>
    );
  };

  const dataformat = (response: any, closingbalance: any) => {
    const aryNewFormat: any = [];

    response &&
      response.map((stmt: any, index: number) => {
        closingbalance = closingbalance + stmt.amount;
        aryNewFormat.push({
          _id: stmt._id,
          // eslint-disable-next-line camelcase
          sr_no: index + 1,
          date: moment(stmt.createdAt).format("lll"),
          credit: stmt.amount,
          debit: stmt.amount,
          closing: closingbalance.toFixed(2),
          narration: stmt.narration,
          stmt: stmt,
        });
      });
    return aryNewFormat;
  };

  return (
    <>
      <div className={!isMobile ? " mt-1" : "padding-custom"}>
        <div className="body-wrap">
          <div className="back-main-menu my-3">
            <a href="/">BACK TO MAIN MENU</a>
          </div>

          <div className="">
            <div
              className="back-main-menu my-3"
              style={{ background: "#3b394a" }}
            >
              <a style={{ background: "#3b394a" }}>MY LEDGER</a>
            </div>

            <div className="card-body p0">
              {/* <form
                className="ng-pristine ng-valid ng-touched mb-0"
                method="post"
                onSubmit={handleSubmitform}
              >
                <div className="row row5">
                  <div className="col-6 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <div className="mx-datepicker">
                        <div className="mx-input-wrapper">
                          <input
                            name="startDate"
                            type="date"
                            autoComplete="off"
                            onChange={handleformchange}
                            defaultValue={filterdata.startDate}
                            placeholder="Select Date"
                            className="mx-input ng-pristine ng-valid ng-touched"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <div className="mx-datepicker">
                        <div className="mx-input-wrapper">
                          <input
                            name="endDate"
                            type="date"
                            autoComplete="off"
                            defaultValue={filterdata.endDate}
                            onChange={handleformchange}
                            placeholder="Select Date"
                            className="mx-input ng-untouched ng-pristine ng-valid"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-2 mbc-5">
                    <div className="form-group mb-0">
                      <select
                        name="reportType"
                        onChange={handleformchange}
                        className="custom-select ng-untouched ng-pristine ng-valid"
                      >
                        <option value="ALL">All </option>
                        <option value="chip">Deposit/Withdraw </option>
                        <option value="game">Game Report </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-lg-1 mbc-5">
                    <button type="submit" className="btn btn-primary btn-block">
                      Submit
                    </button>
                  </div>
                </div>
              </form> */}

              {selectedGroup ? (
                <div>
                  <div className="match-name text-center ng-binding">
                    {/* {openn?.match(/^(\w+)\s*\/\s*Rno-/)?.[1] || ""}{" "}
                    {(() => {
                      const rno = openn?.match(/Rno-(\d+)/)?.[1] || "";
                      const datePart = rno.slice(3, 9); // Get digits 4 to 9
                      if (datePart.length === 6) {
                        const dd = datePart.slice(0, 2);
                        const mm = datePart.slice(2, 4);
                        const yy = datePart.slice(4, 6);
                        return `${yy}-${mm}-${dd}`;
                      }
                      return "";
                    })()} */}
                    {selectedGroup}
                  </div>

                  <div className="table-responsive">
                    <table className="text-center" id="customers1">
                      <thead>
                        <tr>
                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Event ID
                          </th>

                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Number
                          </th>

                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Rate
                          </th>

                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Amount
                          </th>

                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Status
                          </th>

                          <th
                            style={{
                              width: "45%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            Result
                          </th>

                          <th
                            style={{
                              width: "10%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            PL{" "}
                          </th>

                          <th
                            className="d-none"
                            style={{
                              width: "10%",
                              textAlign: "center",
                              background: "#888399",
                            }}
                          >
                            BALANCE
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseAccountStmt.length <= 0 ||
                          (parseAccountStmt.length > 0 &&
                            parseAccountStmt.length <= 0 && (
                              <tr>
                                <td colSpan={8} className="text-center">
                                  No Result Found
                                </td>
                              </tr>
                            ))}
                        {parseAccountStmt.length > 0 &&
                          parseAccountStmt.length > 0 &&
                          page == 0 && (
                            <tr key={parseAccountStmt[0]._id}>
                              {/* <td>-</td> */}
                              {/* <td className='wnwrap'>
                        {moment(parseAccountStmt[0].createdAt).format(dateFormat)}
                      </td> */}
                              {/* <td>-</td>
                      <td>-</td>
                      <td className='wnwrap'>{openBalance?.toFixed(2)}</td>
                      <td className='wnwrap'>Opening Balance</td> */}
                            </tr>
                          )}

                        {getAcHtml22()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="text-center" id="customers1">
                    <thead>
                      <tr>
                        {/* <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      Sr No.
                    </th> */}
                        {/* <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      Date{' '}
                    </th> */}
                        <th
                          className="d-none"
                          style={{
                            width: "45%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          MATCH NAMEk
                        </th>

                        <th
                          style={{
                            width: "45%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          MATCH NAME
                        </th>

                        <th
                          style={{
                            width: "45%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          WON BY
                        </th>

                        <th
                          style={{
                            width: "10%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          WON{" "}
                        </th>
                        <th
                          style={{
                            width: "10%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          LOST
                        </th>
                        <th
                          style={{
                            width: "10%",
                            textAlign: "center",
                            background: "#888399",
                          }}
                        >
                          BALANCE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseAccountStmt.length <= 0 ||
                        (parseAccountStmt.length > 0 &&
                          parseAccountStmt.length <= 0 && (
                            <tr>
                              <td colSpan={8} className="text-center">
                                No Result Found
                              </td>
                            </tr>
                          ))}
                      {parseAccountStmt.length > 0 &&
                        parseAccountStmt.length > 0 &&
                        page == 0 && (
                          <tr key={parseAccountStmt[0]._id}>
                            {/* <td>-</td> */}
                            {/* <td className='wnwrap'>
                        {moment(parseAccountStmt[0].createdAt).format(dateFormat)}
                      </td> */}
                            {/* <td>-</td>
                      <td>-</td>
                      <td className='wnwrap'>{openBalance?.toFixed(2)}</td>
                      <td className='wnwrap'>Opening Balance</td> */}
                          </tr>
                        )}

                      {getAcHtml()}
                    </tbody>
                  </table>
                </div>
              )}
              <ReactPaginate
                breakLabel="..."
                nextLabel=">>"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                containerClassName={"pagination"}
                activeClassName={"active"}
                previousLabel={"<<"}
                breakClassName={"break-me"}
              />
            </div>
          </div>

          <div className="back-main-menu my-2">
            <a href="/">BACK TO MAIN MENU</a>
          </div>
        </div>
      </div>
      <ReactModal
        isOpen={isOpen}
        onAfterClose={() => setIsOpen(false)}
        onRequestClose={(e: any) => {
          setIsOpen(false);
        }}
        contentLabel="Set Max Bet Limit"
        className={"col-md-12"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5>Bets</h5>
            <button
              onClick={() => setIsOpen(false)}
              className="close float-right"
            >
              <i className="fa fa-times-circle"></i>
            </button>
          </div>
          <div className="modal-body">
            {!loadingState && (
              <BetListComponent
                bethistory={betHistory}
                handlePageClick={handlePageClickBets}
                page={page}
                isTrash={false}
              />
            )}
          </div>
        </div>
      </ReactModal>
    </>
  );
};
export default NewAccountStatement;
