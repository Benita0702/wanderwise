// src/pages/ConnectRedirect.js
import { useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { STRAPI_URL } from "../api";

export default function ConnectRedirect() {
  const { provider } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace("#", ""));
    // Try known token names in query or hash
    const token =
      search.get("access_token") ||
      search.get("token") ||
      search.get("jwt") ||
      hash.get("access_token") ||
      hash.get("token") ||
      hash.get("jwt");

    const userParam = search.get("user") || hash.get("user");

    async function finishLogin() {
      if (token) {
        let userObj = null;
        if (userParam) {
          try {
            userObj = JSON.parse(decodeURIComponent(userParam));
          } catch (e) {
            userObj = null;
          }
        }
        if (!userObj) {
          try {
            const res = await axios.get(`${STRAPI_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            userObj = res.data;
          } catch (err) {
            console.error("Failed to fetch user", err);
          }
        }

        if (userObj) {
          Cookies.set("token", token, { expires: 3650, secure: true, sameSite: "strict" });
          Cookies.set("user", JSON.stringify(userObj), { expires: 3650 });
          setUser(userObj);
          navigate("/");
          return;
        }
      }

      // If nothing worked, go back to login
      navigate("/login");
    }

    finishLogin();
  }, [location, provider, navigate, setUser]);

  return <div style={{ textAlign: "center", marginTop: 80 }}>Logging you in...</div>;
}
