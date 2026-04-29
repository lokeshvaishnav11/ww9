import moment from "moment";
import React, { MouseEvent } from "react";
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

const AccountStatement = () => {
  const loadingState = useAppSelector(selectLoader);

  const [currentItems, setCurrentItems] = React.useState<any>([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [itemsPerPage] = React.useState(50);

  const [isOpen, setIsOpen] = React.useState(false);
  const [betHistory, setBetHistory] = React.useState<any>({});
  const [selectedStmt, setSelectedStmt] = React.useState<AccoutStatement>(
    {} as AccoutStatement
  );

  const [openBalance, setOpenBalance] = React.useState(0);
  const [page, setPage] = React.useState(1);

  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: "",
    endDate: "",
    reportType: "All",
  });

  // 🔥 FORMAT FUNCTION
  const dataformat = (
    response: any,
    baseBalance: number,
    startIndex: number
  ) => {
    let closingbalance = baseBalance;

    return response.map((stmt: any, index: number) => {
      closingbalance += stmt.amount;

      return {
        _id: stmt._id,
        sr_no: startIndex + index + 1,
        date: moment(stmt.createdAt).format(dateFormat),
        credit: stmt.amount,
        debit: stmt.amount,
        closing: Number(closingbalance.toFixed(2)),
        narration: stmt.narration,
        stmt: stmt,
      };
    });
  };

  // 🔥 INITIAL DATE
  React.useEffect(() => {
    const filterObj = filterdata;
    filterObj.startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
    filterObj.endDate = moment().format("YYYY-MM-DD");
    setfilterdata({ ...filterObj });

    getAccountStmt(1);
  }, []);

  // 🔥 MAIN API (FINAL FIX)
  const getAccountStmt = async (pageNumber: number) => {
    try {
      const res = await accountService.getAccountList(pageNumber, filterdata);

      const items = res?.data?.data?.items || [];
      const opening = res?.data?.data?.openingBalance || 0;
      const total = res?.data?.data?.total || 0;

      let baseBalance = opening;

      // 🔥 PREVIOUS PAGES SUM
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

      setCurrentItems(
        dataformat(
          items,
          baseBalance,
          (pageNumber - 1) * itemsPerPage
        )
      );

      setOpenBalance(opening);
      setPage(pageNumber);
      setPageCount(Math.ceil(total / itemsPerPage));
    } catch (e: any) {
      toast.error("error");
    }
  };

  // 🔥 PAGINATION
  const handlePageClick = (event: any) => {
    const selectedPage = event.selected + 1;
    getAccountStmt(selectedPage);
  };

  const handleformchange = (event: any) => {
    const filterObj = filterdata;
    filterObj[event.target.name] = event.target.value;
    setfilterdata({ ...filterObj });
  };

  const handleSubmitform = (event: any) => {
    event.preventDefault();
    getAccountStmt(1);
  };

  // 🔥 BET MODAL
  const handlePageClickBets = (event: any) => {
    getBetsData(selectedStmt, event.selected + 1);
  };

  React.useEffect(() => {
    if (isOpen) getBetsData(selectedStmt, 1);
  }, [selectedStmt]);

  const getBetsData = (stmt: AccoutStatement, pageNumber: number) => {
    const betIds: any = stmt?.allBets?.map(({ betId }: any) => betId);

    if (betIds && betIds.length > 0) {
      betService
        .getBetListByIds(betIds, pageNumber)
        .then((res: AxiosResponse) => {
          setIsOpen(true);
          setBetHistory(res.data.data);
        });
    }
  };

  const getBets = (
    e: MouseEvent<HTMLTableCellElement>,
    stmt: AccoutStatement
  ) => {
    e.preventDefault();
    setSelectedStmt(stmt);
    setIsOpen(true);
  };

  // 🔥 TABLE
  const getAcHtml = () => {
    return currentItems.map((stmt: any, index: number) => {
      return (
        <tr key={`${stmt._id}${index}`}>
          <td>{stmt.sr_no}</td>
          <td className="wnwrap">{stmt.date}</td>

          <td>{stmt.narration}</td>

          {/* PREVIOUS BAL */}
          <td>{(stmt.closing - stmt.credit).toFixed(2)}</td>

          <td className="green">
            {stmt.credit >= 0 && stmt.credit.toFixed(2)}
          </td>

          <td className="red">
            {stmt.credit < 0 && stmt.credit.toFixed(2)}
          </td>

          <td className="green">{stmt.closing.toFixed(2)}</td>

          <td onClick={(e) => getBets(e, stmt.stmt)}>
            <span className="label-buttonccc">View Bets</span>
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      <div className={!isMobile ? " mt-1" : "padding-custom"}>
        <div className="body-wrap">
          <div className="table-responsive">
            <table className="text-center" id="customers1">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Prev Bal</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Balance</th>
                  <th>Bets</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No Result Found</td>
                  </tr>
                ) : (
                  getAcHtml()
                )}
              </tbody>
            </table>
          </div>

          {/* 🔥 PAGINATION */}
          <ReactPaginate
            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousLabel={"Prev"}
          />
        </div>
      </div>

      {/* 🔥 BET MODAL */}
      <ReactModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className={"col-md-12"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5>Bets</h5>
            <button onClick={() => setIsOpen(false)} className="close">
              ✖
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

export default AccountStatement;
