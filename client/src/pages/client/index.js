import {
  Main,
  Hero,
  BeatsShopSection,
  ProfileCard,
  Head,
  BeatShopSectionForClient,
} from "@/components";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function BuyerProfile() {
  const currentUser = useSelector((state) => state.client.authSession.session.current);

  return (
    <>
      <Head title="Buyer Profile" />
      <Main mode="transparent">
        <Hero
          style={{ height: "45vh" }}
          image={currentUser.backImage}
          alt="hero"
          className="items-center justify-center align-middle"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.png";
          }}
        >
          <div
            id="contenido"
            className="padding-x-estilo2 flex h-full w-full flex-col justify-end pb-8"
          >
            <div>
              <ProfileCard
                profilePhoto={currentUser.profilePicture}
                profileName={`${currentUser.firstName}${" "}${
                  currentUser.lastName
                }`}
                profileMessage={currentUser.bio}
              />
            </div>
          </div>
        </Hero>
        <BeatShopSectionForClient />
      </Main>
    </>
  );
}
