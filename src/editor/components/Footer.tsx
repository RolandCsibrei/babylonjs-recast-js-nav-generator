import styled from "styled-components";

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;

  display: flex;
  align-items: center;

  box-sizing: border-box;
  padding: 1em;
  font-size: 0.95rem;
  font-weight: 300;

  color: #aaa;

  div {
    display: flex;
    align-items: center; /* Ensures child elements (SVG & text) align vertically */
    gap: 8px; /* Adds spacing between the SVG and the text */
  }
  a {
    color: #ccc;
  }
`;

const GithubSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    stroke="#fff"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
  </svg>
);

export const Footer = () => {
  return (
    <FooterContainer>
      <div>
        <a
          title="babylon.js NavMesh Editor"
          target="_blank"
          href="https://github.com/RolandCsibrei/babylonjs-recast-navigation-js-editor"
        >
          <GithubSvg />
        </a>
        babylon.js NavMesh Editor v1.0.&nbsp;&nbsp;Powered by{" "}
        <a
          target="_blank"
          href="https://github.com/isaac-mason/recast-navigation-js"
        >
          recast-navigation-js
        </a>
        &nbsp;and&nbsp;
        <a target="_blank" href="https://babylonjs.com">
          babylon.js
        </a>
      </div>
    </FooterContainer>
  );
};
