/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faInfoCircle, faX, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./UpdateUserInfo.module.css";

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;

const UpdateUserInfo = ({ userData }) => {
  const userId = useParams().id;

  const errRef = useRef(null);

  const [name, setName] = useState(userData?.name || "");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email] = useState(userData?.email || "");

  const [bio, setBio] = useState(userData?.bio || "");
  const [validBio, setValidBio] = useState(false);
  const [BioFocus, setBioFocus] = useState(false);

  const [links, setLinks] = useState(userData?.links || []);
  const [newLink, setNewLink] = useState("");
  const [isLinksChanged, setIsLinksChanged] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  useEffect(() => setErrMsg(""), [name, bio, links]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidBio(bio.length <= 250);
  }, [bio]);

  useEffect(() => {
    setIsLinksChanged(!arraysEqual(links, userData?.links));
  }, [links, userData?.links]);

  const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  const addLinkToLinks = async () => {
    if (!newLink) return null;

    if (links.length === 3) {
      return notify("info", "Maximum number of links is 3")
    }

    if (links.includes(newLink)) {
      return notify("info", "Link have been already added")
    }

    setLinks([...links, newLink]);

    setNewLink("");
  }

  const removeFromLinks = async (link) => {
    setLinks(links.filter(l => l !== link));
  }

  const sendUpdates = async (e) => {
    e.preventDefault();

    try {
      if (!NAME_REGEX.test(name)) {
        await setErrMsg("Invalid Name");
        errRef.current.focus();
        return null;
      }

      if (bio.length > 250) {
        await setErrMsg("Bio must be at most 250 characters");
        errRef.current.focus();
        return null;
      }

      if (links.length > 3) {
        await setErrMsg("Max number of links is 3");
        errRef.current.focus();
        return null;
      }

      setUpdateLoading(true);

      const res = await axiosPrivate.patch(
        `users/${userId}`,
        { name: name, bio: bio, links: links }
      );

      notify("success", res.data.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Update is Failed');
      errRef.current.focus();
    }

    finally {
      setUpdateLoading(false);
    }
  }

  return (
    <form
      className={style.update_user_info}
      onSubmit={sendUpdates}
    >
      {/* Section Title */}
      <h3>Main Information</h3>

      {/* Error Message */}
      <>
        {
          errMsg &&
          <p
            ref={errRef}
            className={style.error_message}
            aria-live="assertive"
          >
            {errMsg}
          </p>
        }
      </>

      {/* Name */}
      <div>
        <label htmlFor="name">
          Name:
        </label>
        <span className={style.check_mark}>
          {
            name === "" ? ("")
              : validName ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="text"
          id="name"
          autoComplete="off"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
          aria-invalid={!validName ? "true" : "false"}
          aria-describedby="nameNote"
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
        />
        {
          nameFocus && name && !validName ?
            <p id="nameNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Name must be 4 to 24 characters.<br />
              Must begin with a letter.<br />
              Letters, numbers, underscores, hyphens allowed.<br />
              No spaces.
            </p>
            : ""
        }
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">
          Email:
        </label>
        <input
          type="email"
          id="email"
          autoComplete="off"
          placeholder="Email"
          value={email}
          readOnly={true}
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio">
          Bio:
        </label>
        <span className={style.check_mark}>
          {
            validBio ?
              (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
              : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <textarea
          autoComplete="off"
          id="bio"
          placeholder="Bio"
          onChange={(e) => setBio(e.target.value)}
          value={bio}
          aria-invalid={!validBio ? "true" : "false"}
          aria-describedby="emailNote"
          onFocus={() => setBioFocus(true)}
          onBlur={() => setBioFocus(false)}
        ></textarea>
        {
          BioFocus && !validBio ?
            <p id="bioNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Bio must be at most 250 characters
            </p>
            : ""
        }
      </div>

      {/* Links */}
      <div className={style.links_container}>
        <label htmlFor="links">
          Links:
        </label>
        <div className={style.links}>
          {
            links.length > 0 ? links.map((link) => (
              <div key={link} className={style.link}>
                <Link to={link} target="_blank">
                  {link}
                </Link>
                <button
                  type="button"
                  title="remove link"
                  onClick={() => removeFromLinks(link)}
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
              </div>
            ))
              : links.length === 0 ?
                (<p className={style.no_links_added}>
                  No links added
                </p>)
                : ""
          }
        </div>
        <div className={style.add_link}>
          <input
            type="text"
            id="links"
            autoComplete="off"
            placeholder="Add new link"
            onChange={(e) => setNewLink(e.target.value)}
            value={newLink}
          />
          <button
            type="button"
            title="add link"
            onClick={addLinkToLinks}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={
          updateLoading ||
            (
              name === userData?.name
              && bio === userData?.bio
              && !isLinksChanged
            )
            ? true
            : false
        }
        style={
          updateLoading ||
            (
              name === userData?.name
              && bio === userData?.bio
              && !isLinksChanged
            )
            ? { opacity: .5, cursor: "revert" }
            : {}
        }
      >
        <span>Save Updates</span>
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  )
}

export default UpdateUserInfo
