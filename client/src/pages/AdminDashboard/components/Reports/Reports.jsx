import { useEffect, useState } from "react";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import ReportCard from "../ReportCard/ReportCard";
import style from "./Reports.module.css";

const Reports = () => {
  const reportsLimit = 10;
  const [reportsPage, setReportsPage] = useState(1);

  const [reports, setReports] = useState([]);
  const [fetchReportsLoad, setFetchReportsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setFetchReportsLoad(true);
        const res = await axiosPrivate.get(
          `/reports?page=${reportsPage}&limit=${reportsLimit}`
        );
        setReports((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchReportsLoad(false);
      }
    }
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsPage]);

  return (
    <div className={`${style.reports}`}>
      <>
        {
          fetchReportsLoad && reports.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : reports.length > 0 ?
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

      <>
        {
          fetchReportsLoad && reports.length === 0 ? ("")

            : fetchReportsLoad || reportsPage * reportsLimit === reports.length ?
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

              : reportsPage * reportsLimit > reports.length ?
                (<p className={style.no_more_reports_message}>
                  This section has {reports.length} reports
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default Reports
