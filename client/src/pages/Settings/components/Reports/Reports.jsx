import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import ReportCard from "../ReportCard/ReportCard";
import style from "./Reports.module.css";

const Reports = () => {
  const user = useSelector(state => state.user);

  const reportsLimit = 10;
  const [reportsPage, setReportsPage] = useState(1);

  const [reports, setReports] = useState([]);
  const [fetchReportsLoad, setFetchReportsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setFetchReportsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/createdReports?page=${reportsPage}&limit=${reportsLimit}`
        );
        setReports((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(
          err,
          [
            "handleNoServerResponse",
            "handleServerError",
            "handleUnauthorized",
            "handleExpiredRefreshToken",
            "handleNoResourceFound"
          ]
        );
      } finally {
        setFetchReportsLoad(false);
      }
    }
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsPage]);

  return (
    <div className={`${style.reports}`}>
      {/* Reports section */}
      <>
        {
          // While fetching reports and reports length is 0
          fetchReportsLoad && reports.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If reports have been fetched
            : reports?.length && reports.length > 0 ?
              (<div className={style.viewer}>
                {
                  reports.map((report) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      reports={reports}
                      setReports={setReports}
                    />
                  ))
                }
              </div>)

              : ("")
        }
      </>

      {/* Load more reports btn section */}
      <>
        {
          fetchReportsLoad && reports.length === 0 ? ("")

            // While fetching reports || If there are reports in db
            : fetchReportsLoad
              || reportsPage * reportsLimit === reports.length ?
              (<button
                type="button"
                className={style.load_more_reports_btn}
                disabled={fetchReportsLoad ? true : false}
                style={fetchReportsLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchReportsLoad(true)
                  setReportsPage(prev => prev + 1)
                }}
              >
                {
                  fetchReportsLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              // If reports reaches last report
              : reportsPage * reportsLimit > reports.length ?
                (<p className={style.no_more_reports_message}>
                  This section has {reports.length} reports
                </p>)

                // No thing
                : ("")
        }
      </>
    </div>
  )
}

export default Reports
