import { useEffect, useState } from "react";

const CookieConsent = () => {
  const [cookieConsent, setCookieConsent] = useState(true); // Hide until polled locally
  useEffect(() => {
    const _cookieConsent = localStorage.getItem("cookieConsent");
    if (!_cookieConsent) {
      setCookieConsent(false);
    }
  }, []);

  return !cookieConsent ? (
    <div className={"cc-container"}>
      <div className={"cc-text"}>
        <h4>Hi there! 👋</h4>
        Fluidity uses cookies to ensure that we give you the best experience on
        our website. These are mostly for analytics and security purposes.
        <br />
        If you are curious about what we use cookies for, please read our{" "}
        <a href="https://fluidity.money/privacy" className={"cc-link"}>
          Privacy Policy
        </a>
        .<br />
        We&apos;re open source, so our data usage is fully transparent.
      </div>
      <button
        className={"cc-button"}
        onClick={() => {
          localStorage.setItem("cookieConsent", "true");
          setCookieConsent(true);
        }}
      >
        Got it!
      </button>
    </div>
  ) : null;
};
export default CookieConsent;