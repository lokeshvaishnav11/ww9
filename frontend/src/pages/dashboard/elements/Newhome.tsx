import React from "react";

import "./Newhome.css";

const Newhome = () => {

  const handleClick = () => {
    // setImgSrc("imgs/opps.png");
    alert("Opsss ! This Game is Comming Soon")
  };
  return (
    <>
      <div>
        <div
          ng-view=""
          ng-class="virtualGame ? '': 'body-wrap'"
          style={{ overflowX: "hidden" }}
          className="ng-scope body-wrap"
        >
          <div className="body-menu-list ng-scope">
            <div className="row">
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/match/4">
                  <img src="/imgs/crick.png" />{" "}
                  <br /> In Play{" "}
                </a>
              </div>
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/match/matka">
                  <img src="/imgs/matka.png" />{" "}
                  <br />
                  Matka
                </a>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/casino-in/live-dmd">
                  <img src="/imgs/casino.png" />{" "}
                  <br />
                  Casino Games{" "}
                </a>
              </div>

              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="https://punjabguru.com/">
                  <img src="/imgs/moregames.webp" style={{ borderRadius: "50%" }} />{" "}
                  <br /> More Games{" "}
                </a>
              </div>
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/accountstatement">
                  <img src="/imgs/statements.png" />{" "}
                  <br /> Statement{" "}
                </a>
              </div>
               <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/complete-games">
                  <img src="/imgs/CG1.png" />{" "}
                  <br /> Complete Games{" "}
                </a>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/new-accountstatement">
                  <img src="/imgs/CL1.png" />{" "}
                  <br />
                  My Ledger
                </a>
              </div>
              {/* <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/complete-games">
                  <img src="/imgs/CG1.png" />{" "}
                  <br /> Complete Games{" "}
                </a>
              </div> */}

              <div className="col text-center menu-list-item">
                <a href="/profile">
                  <img src="/imgs/Profile.png" />{" "}
                  <br /> My Profile{" "}
                </a>
              </div>

            </div>
            <div className="row">
              <div className="col-md-6 col-6 text-center menu-list-item">
                <a href="/changepassword">
                  <img src="/imgs/CP1.png" />{" "}
                  <br /> Change Password{" "}
                </a>
              </div>

              {/* <div className="col text-center menu-list-item">
                <a href="/profile">
                  <img src="/imgs/Profile.png" />{" "}
                  <br /> My Profile{" "}
                </a>
              </div> */}

              <div className="col text-center menu-list-item">
                <div onClick={handleClick}>
                  <img src="/imgs/kabaddi-img.png" />{" "}
                  <br /> Kabbadi{" "}

                </div>
              </div>


            </div>



            <div className="row">







              <div className="col text-center menu-list-item">
                <div onClick={handleClick}>
                  <img src="/imgs/ludo-9xpro.png" />{" "}
                  <br /> Ludo{" "}

                </div>
              </div>

{/* 
              <div className="col text-center menu-list-item">
                <div onClick={handleClick}>
                  <img src="/imgs/kabaddi-img.png" />{" "}
                  <br /> Kabbadi{" "}

                </div>
              </div> */}

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Newhome;
