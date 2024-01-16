// Modules
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
// Api axios
import { useAxiosPrivate } from "../../hooks";
// Css style
import style from "./Report.module.css";

const Report = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosPrivate.get(`reports/${id}`);
        setContent(res?.data?.data?.content || "");
      } catch (err) {
        if (!err?.response) {
          navigate(
            '/noServerResponse',
            { state: { from: location }, replace: true }
          );
        } else if (err?.response?.status === 403) {
          navigate(
            '/unauthorized',
            { state: { from: location }, replace: true }
          );
        }
      }
    }
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.create_report}>
      {/* Page Title */}
      <h2>Report</h2>

      {/* Content */}
      <textarea
        name="content"
        id="content"
        readOnly={true}
        value={content}
      >
      </textarea>

      {/* Edit Link */}
      <Link to={`/reports/${id}/update`}>
        Edit This Report
      </Link>
    </div>
  )
}

export default Report
