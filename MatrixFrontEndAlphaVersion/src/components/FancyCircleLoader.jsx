import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        <div className="spinnerin" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .spinner {
    width: 3em;
    height: 3em;
    cursor: not-allowed;
    border-radius: 50%;
    border: 2.5px solid var(--loader-border, #4F46E5);
    box-shadow:
      -10px -10px 18px #818CF8,
      0px -10px 18px #7551FF,
      10px -10px 18px #4318FF,
      10px 0 18px #A195FD,
      10px 10px 18px #4F46E5,
      0 10px 18px #7551FF,
      -10px 10px 18px #4318FF;
    animation: rot55 0.7s linear infinite;
    position: relative;
    background: transparent;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .spinnerin {
    border: 2.5px solid var(--loader-inner, #7551FF);
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    transition: border-color 0.3s;
  }

  @media (prefers-color-scheme: dark) {
    .spinner {
      border-color: #1B254B;
      --loader-border: #1B254B;
      box-shadow:
        -10px -10px 18px #3311DB,
        0px -10px 18px #7551FF,
        10px -10px 18px #422AFB,
        10px 0 18px #2111A5,
        10px 10px 18px #3311DB,
        0 10px 18px #7551FF,
        -10px 10px 18px #422AFB;
    }
    .spinnerin {
      border-color: #7551FF;
      --loader-inner: #7551FF;
    }
  }

  @keyframes rot55 {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Loader; 