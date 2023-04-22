import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serverUrl } from "@/data/config";
import axios from "axios";
import { data } from "autoprefixer";

const initialState = {
  publicBeatsFetchStatus: false, //deprecated
  authorFetchStatus: false, //deprecated
  reviewFetchStatus: false,
  beatsDisplayMode: null, //deprecated
  currentAuthorLastId: null, //deprecated
  currentAuthor: {},
  publicItems: [],
  userFavoriteBeats: [],
  userPurchasedBeats: [],
  userOwnedBeats: [],
  currentAuthorBeats: [],
  activeItems: [],
  activeItemDetail: null,
  generalActiveIndex: 0,
  activeReviewDetail: [],
  loadingcurrentAuthor: false,
  pageIndex: 1,
  pages: {
    next: null,
    prev: null,
    current: 1,
    limit: null,
  },
};

export const fetchBeats = createAsyncThunk(
  "beats/fetchBeats",

  async ({
    page,
    minPrice,
    maxPrice,
    minBPM,
    maxBPM,
    name,
    BPM,
    priceAmount,
    rating,
    genre,
  }) => {
    const queryParameters = {
      ...(minPrice !== 0 && !isNaN(minPrice) && { minPrice }),
      ...(maxPrice !== 0 && !isNaN(maxPrice) && { maxPrice }),
      ...(minBPM !== 0 && !isNaN(minBPM) && { minBPM }),
      ...(maxBPM !== 0 && !isNaN(maxBPM) && { maxBPM }),
      ...(name && { name }),
      ...(BPM && { BPM }),
      ...(priceAmount && { priceAmount }),
      ...(rating && { rating }),

      // Agrega aquí otros parámetros de consulta que quieras incluir
    };

    let queryString = "";
    Object.entries(queryParameters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryString += `&${key}=${encodeURIComponent(value)}`;
      }
    });

    console.log(genre);

    const response = await axios.get(
      `${serverUrl}beats?page=${page}&${queryString.substr(1)}`,
      {
        headers: {
          genre,
        },
      }
    );

    return {
      docs: response.data.docs,
      next: response.data.nextPage,
      prev: response.data.prevPage,
      current: response.data.page,
      limit: response.data.totalPages,
    };
  }
);

//IGNORAR ESTE CODIGO
// export const fetchBeats = createAsyncThunk(
//   "beats/fetchBeats",
//   async ({ page = 1, minPrice = 40 }) => {
//     console.log("fetchBeats", page, minPrice);

//     const queryParameters = {
//       page: page,
//       minPrice: minPrice,
//       // Agrega aquí otros parámetros de consulta que quieras incluir
//     };

//     let queryString = "";
//     Object.entries(queryParameters).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         queryString += `&${key}=${encodeURIComponent(value)}`;
//       }
//     });

//     console.log("fetchBeats", `${serverUrl}beats?${queryString.substr(1)}`);

//     const response = await axios.get(`${serverUrl}beats?${queryString.substr(1)}`);

//     return {
//       docs: response.data.docs,
//       next: response.data.nextPage,
//       prev: response.data.prevPage,
//       current: response.data.page,
//       limit: response.data.totalPages,
//     };
//   }
// );

export const fetchUserBeats = createAsyncThunk(
  "beats/fetchUserBeats",
  async (_, { getState }) => {
    const id = getState().client.client._id;
    const response = await axios.get(`${serverUrl}user/${id}`);
    const userPurchasedBeats = response.data.bougthBeats;
    const userOwnedBeats = response.data.createdBeats;
    return { userPurchasedBeats, userOwnedBeats };
  }
);

export const fetchCurrentAuthor = createAsyncThunk(
  "beats/fetchCurrentAuthor",
  async (id) => {
    const response = await axios.get(`${serverUrl}user/${id}`);
    const currentAuthorBeats = response.data.createdBeats;
    //solo obtenemos el nombre y el id del objeto original
    const currentAuthor = {
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      //Actualmente sale undefined pero fue necesario para el funcionamiento de json-server
      _id: response.data._id,
      profilePicture: response.data.image,
      username: response.data.username,
    };
    return { beats: currentAuthorBeats, currentAuthor };
  }
);

export const fetchUserReviews = createAsyncThunk(
  "beats/fetchUserReview",
  async (id) => {
    const response = await axios.get(`${serverUrl}review/user/${id}`);
    const userReviews = response.data;

    //Obtenemos la data necesaria (Titulo, username, comentario, rating e id )
    const reviews = userReviews.map((review) => ({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      _id: review._id,
      username: review.createdBy.username,
      beat: id,
    }));

    return reviews;
  }
);

const beatsSlice = createSlice({
  name: "beats",
  initialState,
  reducers: {
    setBeatsDisplayMode(state, action) {
      state.beatsDisplayMode = action.payload;
      if (action.payload === 0 || action.payload === 1) {
        state.activeItems = state.publicItems;
      }
    },
    setActiveItemDetail(state, action) {
      state.activeItemDetail = action.payload;
    },
    setGeneralActiveIndex(state, action) {
      if (action.payload === 0) state.activeItems = state.userPurchasedBeats;
      else if (action.payload === 1) state.activeItems = state.userOwnedBeats;
      else if (action.payload === 2) state.activeItems = [];
      else state.activeItems = [];
      state.generalActiveIndex = action.payload;
    },
    //Carga de beats
    setCurrentAuthorBeats(state, action) {
      state.currentAuthorBeats = action.payload.beats;
      state.currentAuthor = action.payload.authorId;
      state.beatsDisplayMode = 3;
      state.authorFetchStatus = true;
    },
    setBeats(state, action) {
      state.publicBeatsFetchStatus = true;
      state.publicItems = action.payload;
    },
    setUserOwnedBeats(state, action) {
      state.userOwnedBeats = action.payload;
    },
    setUserPurchasedBeats(state, action) {
      state.userPurchasedBeats = action.payload;
    },
    setUserFavoriteBeats(state, action) {
      state.userFavoriteBeats = action.payload;
    },
    setCurrentPage(state, action) {
      state.pageIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      //--------------------
      //Extra reducers para los beats publicos 0 1
      .addCase(fetchBeats.pending, (state, action) => {
        state.publicBeatsFetchStatus = false;
      })
      .addCase(fetchBeats.fulfilled, (state, action) => {
        if (
          !Array.isArray(action.payload.docs) ||
          action.payload.docs.length === 0 ||
          action.payload.docs === null ||
          action.payload.docs === undefined
        ) {
          state.publicItems = [];
          state.activeItems = [];
          return;
        }
        state.publicBeatsFetchStatus = true;
        state.publicItems = action.payload.docs || [];
        state.activeItems = action.payload.docs || [];
        state.pages.next = action.payload.next;
        state.pages.prev = action.payload.prev;
        state.pages.current = action.payload.current;
        state.pages.limit = action.payload.limit;

        // state.beatsDisplayMode = 1;
      })
      .addCase(fetchBeats.rejected, (state, action) => {
        console.error(" fetch error");
      })

      //--------------------
      //Extra reducers para los beats del usuario 2
      .addCase(fetchUserBeats.pending, (state, action) => {
        state.authorFetchStatus = false;
      })
      .addCase(fetchUserBeats.fulfilled, (state, action) => {
        state.authorFetchStatus = true;
        state.userPurchasedBeats = action.payload.userPurchasedBeats;
        state.userOwnedBeats = action.payload.userOwnedBeats;
        state.userFavoriteBeats = [];
        state.beatsDisplayMode = 2;
        state.generalActiveIndex = 0;
        state.activeItems = state.userPurchasedBeats;
      })
      .addCase(fetchUserBeats.rejected, (state, action) => {
        console.error(action.error);
      })

      //--------------------
      //Extra reducers para el perfil del autor 3
      .addCase(fetchCurrentAuthor.pending, (state, action) => {
        state.authorFetchStatus = false;
        state.loadingcurrentAuthor = true;
      })
      .addCase(fetchCurrentAuthor.fulfilled, (state, action) => {
        state.currentAuthor = action.payload.currentAuthor;
        state.currentAuthorBeats = action.payload.beats;
        state.beatsDisplayMode = 3;
        state.loadingcurrentAuthor = false;
      })
      .addCase(fetchCurrentAuthor.rejected, (state, action) => {
        console.error(action.error);
      })

      //--------------------
      //extra reducers para review
      .addCase(fetchUserReviews.pending, (state, action) => {
        {
          state.reviewFetchStatus = false;
        }
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.activeReviewDetail = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        console.error("fetch error");
      });
  },
});

export const {
  setBeats,
  setActiveItemDetail,
  setBeatsDisplayMode,
  setGeneralActiveIndex,
  setUserOwnedBeats,
  setUserPurchasedBeats,
  setUserFavoriteBeats,
  setCurrentAuthorBeats,
  setActiveItemsForProfile,
  setCurrentPage,
} = beatsSlice.actions;

export default beatsSlice.reducer;

//Version 1.0.0

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { beats } from "../../data/fakeDB";
// import axios from "axios";

// const initialState = {
//   publicBeatsFetchStatus: false,
//   authorFetchStatus: false,
//   beatsDisplayMode: null,
//   currentAuthorLastId: null,
//   currentAuthor: {},
//   publicItems: [],
//   userFavoriteBeats: [],
//   userPurchasedBeats: [],
//   userOwnedBeats: [],
//   currentAuthorBeats: [],
//   activeItems: [],
//   activeItemDetail: null,
//   generalActiveIndex: 0,
// };

// const beatsSlice = createSlice({
//   name: "profile",
//   initialState,
//   reducers: {
//     //Establecemos los beats en el estado global
//     setBeats(state, action) {
//       console.log("setBeats", action.payload);
//       state.publicBeatsFetchStatus = true;
//       state.publicItems = action.payload;
//     },
//     setUserOwnedBeats(state, action) {
//       state.userOwnedBeats = action.payload;
//     },
//     setUserPurchasedBeats(state, action) {
//       console.log("setUserPurchasedBeats", action.payload);
//       state.userPurchasedBeats = action.payload;
//     },
//     setUserFavoriteBeats(state, action) {
//       state.userFavoriteBeats = action.payload;
//     },
//     setCurrentAuthorBeats(state, action) {

//       state.currentAuthorBeats = action.payload.beats;
//       state.currentAuthor = action.payload.authorId
//       state.beatsDisplayMode = 3;
//       state.authorFetchStatus = true;
//       console.log("setCurrentAuthorBeats", action.payload, state.beatsDisplayMode );
//     },
//     setActiveItemDetail(state, action) {
//       state.activeItemDetail = action.payload;
//     },
//     //Establecemos los beats activos en el estado global
//     setActiveItemsForProfile(state, action) {
//       if (action.payload === undefined || action.payload === null) {
//         action.payload = state.generalActiveIndex;
//       }
//       action.payload === 0
//         ? (state.activeItems = state.userPurchasedBeats)
//         : action.payload === 1
//         ? (state.activeItems = state.userOwnedBeats)
//         : (state.activeItems = state.userFavoriteBeats);
//     },
//     //Establecemos el modo de visualización de los beats
//     setBeatsDisplayMode(state, action) {
//       //beatsDisplayMode = shop 0, demo 1, profile 2, currentAuthorBeats 3
//       console.log("setBeatsDisplayMode", action.payload);
//       state.beatsDisplayMode = action.payload;
//       if (action.payload === 0 || action.payload === 1) {
//         console.log("Establecemos active", action.payload);
//         state.activeItems = state.publicItems;
//       }
//     },
//     //Establecemos el indice de la pestaña activa en el perfil
//     setGeneralActiveIndex(state, action) {
//       state.generalActiveIndex = action.payload;
//     },
//   },
// });

// export const {
//   setBeats,
//   setActiveItemDetail,
//   setBeatsDisplayMode,
//   setGeneralActiveIndex,
//   setUserOwnedBeats,
//   setUserPurchasedBeats,
//   setUserFavoriteBeats,
//   setCurrentAuthorBeats,
//   setActiveItemsForProfile,
// } = beatsSlice.actions;
// export default beatsSlice.reducer;

// export const fetchBeats = () => async (dispatch, getState) => {
//   try {
//     //solicitamos get con axios
//     const data = await axios.get("http://localhost:3001/beats");
//     const beatsResponse = data.data;
//     dispatch(setBeats(beatsResponse));
//     console.log("data", beatsResponse);
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const fetchUserBeats = () => async (dispatch, getState) => {
//   try {
//     console.log("fetchUserBeats, beats");
//     // dispatch(setUserOwnedBeats(userOwnedBeats));

//     const id = getState().client.client._id;
//     const data = await axios.get(`http://localhost:3001/user/${id}`);
//     const userPurchasedBeats = data.data.bougthBeats;
//     const userOwnedBeats = data.data.createdBeats;
//     console.log("userPurchasedBeats", userPurchasedBeats);
//     dispatch(setUserPurchasedBeats(userPurchasedBeats));
//     dispatch(setUserOwnedBeats(userOwnedBeats));
//     dispatch(setUserFavoriteBeats([]));
//     dispatch(setActiveItemsForProfile());
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const fetchCurrentAuthor = (id) => async (dispatch, getState) => {
//   try {
//     console.log("id", id);
//    //
//     const data = await axios.get(`http://localhost:3001/user/${id}`);
//     const currentAuthorBeats = data.data.createdBeats;
//     console.log("beats del autor actual", currentAuthorBeats);
//     dispatch(setCurrentAuthorBeats({beats: currentAuthorBeats, authorId: id}));
//    // dispatch(setCurrentAuthor(id));
//     //dispatch(setBeatsDisplayMode(3));
//   } catch (error) {
//     console.error(error);
//   }
// };
