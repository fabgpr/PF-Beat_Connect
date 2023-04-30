import {
  SellerDashboardLayout,
  IslandDashboard,
  FormColumn,
  FormContainer,
  FormRow,
  Input,
  SwitchForm,
  AdminCreateBeatForm,
  Head,
} from "@/components";

import {
  handleInputChange,
  handleSubmit,
  validateForm,
} from "@/data/formLogic";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminPostUser } from "@/redux/slices/admin";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function AdminBeatsCreate() {
  const [t] = useTranslation("global");
  const childRef = useRef(null);

  const handleExternalSubmit = () => {
    childRef.current.submit();
  };

  return (
    <>
    <Head title="Editar beat" />
      <main>
        <SellerDashboardLayout
          topBarMode="action"
          topBarMessage={t("adminBeatsCreate.title")}
          topBarButtonLabel={t("adminBeatsCreate.t1")}
          onClick={handleExternalSubmit}
        >
          <IslandDashboard className="flex flex-col gap-5 xl:gap-8 ">
            <AdminCreateBeatForm mode="edit" ref={childRef} />
          </IslandDashboard>
        </SellerDashboardLayout>
      </main>
    </>
  );
}

