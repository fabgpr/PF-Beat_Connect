import {
  SellerDashboardLayout,
  IslandDashboard,
  FaqsGrid,
  DynamicTable,
  ModalTables,
  Head,
} from "@/components";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  adminGetReviews,
  adminDeleteReview,
  setCurrentEditingReview,
} from "@/redux/slices/admin/reviews";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";

export default function SellerDashboardOverview() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { reviews } = useSelector((state) => state.admin.reviews);
  const reviewsData = reviews;
  
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const headers = [
    "Beat",
    "Review",
    "Creador",
    "Acciones",
  ];

  useEffect(() => {
    dispatch(adminGetReviews());
  }, []);

  const handleCloseModal = async () => {
    dispatch(adminGetReviews());
    setReviewToDelete(null);
  };

  const handleEdit = async (data) => {
    console.log("handleEdit", data);
    await dispatch(setCurrentEditingReview(data));
    router.push(`/admin/reviews/${data._id}`);
  };

  const rows = reviewsData.map((item) => {
    return {
      // id: item._id,
      review: (<div>
         <p className="text-sm-light">{item.title}</p>
        <p className="text-sm-light">{item.rating} estrellas</p>
      </div>),
      creador: item.createdBy.username,
      beat: (
        <div className="flex items-center gap-4 ">
          <Image
            src={item.beat.image}
            width={70}
            height={70}
            className="aspect-square rounded-xl object-cover"
          />
          <div className="flex flex-col">
            <h3 className="text-base-medium">{item.beat.name}</h3>
          </div>
        </div>
      ),
      acciones: (
        <div className="flex w-max gap-4" key={item._id}>
          <button
            onClick={() => handleEdit(item)}
            className=" hover:background-neutral-gray-700 text-sm-semibold 
            border-radius-estilo2 text-black dark:text-white"
          >
            Editar
          </button>
          <button
            onClick={() => setReviewToDelete(item)}
            className=" hover:background-primary-red-700 text-sm-semibold 
            border-radius-estilo2 text-red-700 "
          >
            Eliminar
          </button>
        </div>
      ),
    };
  });
  return (
    <>
      <Head title="Reviews" />
      <main>
        <SellerDashboardLayout
          topBarMode="action"
          topBarMessage="Reviews de la pagina"
          topBarButtonLabel="Crear review"
          onClick={() => {
            router.push("/admin/reviews/create");
          }}
        >
          <IslandDashboard className="flex flex-col gap-5 xl:gap-8 ">
            <DynamicTable headers={headers} rows={rows} />
          </IslandDashboard>
        </SellerDashboardLayout>
      </main>
      {reviewToDelete && (
        <ModalTables
          label="Review"
          name={"title"}
          element={reviewToDelete}
          onClose={handleCloseModal}
          onConfirm={() => dispatch(adminDeleteReview(reviewToDelete._id))}
        />
      )}
    </>
  );
}
