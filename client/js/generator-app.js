import Axios from "axios";
import Joi from "joi";

export default function MoviePlaylistApp() {
  return {
    /////////////////
    // View Constants
    VIEW_HOME: 1,
    VIEW_PRODUCT: 2,
    VIEW_ABOUT: 3,
    VIEW_CONTACT: 4,
    VIEW_SEARCH: 5,
    VIEW_SIGNIN: 6,
    VIEW_SIGNUP: 7,
    VIEW_PROFILE: 10,
    VIEW_PASSWORD: 11,
    VIEW_CART: 15,
    VIEW_LOADING: 6000,
    ////////////

    currentView: this.VIEW_HOME,
    serverUrl: "http://localhost:4017",
    user: {
      user_name: "",
      password: "",
      first_name: "",
      lastname: "",
      email_address: "",
      contact_number: "",
    },
    accountToken: "",
    menuBarSearchText: "",
    movieSearchText: "",
    popupMessage: "",
    popupVisible: false,
    accountVisible: false,
    profileData: {
      user_name: "",
      first_name: "",
      lastname: "",
      date_registred: "",
      email_address: "",
      countact_number: "",
    },
    orderData: [],
    orderProductsData: [],

    homeData: [],
    searchData: [],
    cartData: [],

    addressData: [],

    init() {
      this.checkUserToken();

      (this.currentView = this.VIEW_HOME), this.loadHome();
    },

    openHome() {
      this.currentView = this.VIEW_HOME;

      this.loadHome();
    },

    openSignIn() {
      this.currentView = this.VIEW_SIGNIN;
      this.user.first_name = "";
      this.user.lastname = "";
      this.user.password = "";
      this.user.user_name = "";
    },
    openSignUp() {
      this.currentView = this.VIEW_SIGNUP;
      this.user.first_name = "";
      this.user.lastname = "";
      this.user.password = "";
      this.user.user_name = "";
    },
    openFavoriteMovie() {
      this.favoriteVisible = true;
      this.movieSelectList = [];
      this.favoriteMovies = [];

      this.getPlaylist();
    },

    openMovieSearch() {
      this.movieSearchText = this.menuBarSearchText;

      this.favoriteVisible = false;
      this.movieSelectList = [];
      this.favoriteMovies = [];

      // this.menuBarSearchText = "";
      if (this.movieSearchText.trim().length > 0) {
        this.searchMovie();
      }
    },

    signIn() {
      let loginInfo = {
        user_name: this.user.user_name,
        password: this.user.password,
      };
      let scheme = Joi.object({
        user_name: Joi.string().alphanum().min(5).max(25).required(),
        password: Joi.string().min(5).max(15).required(),
      });

      let sResult = scheme.validate(loginInfo);

      if (sResult.error !== undefined) {
        this.handleMessage(sResult.error.details[0].message);
        return;
      }

      Axios.post(`${this.serverUrl}/api/login`, loginInfo)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.saveToken();
            this.accountVisible = true;
            this.currentView = this.VIEW_HOME;
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    signUp() {
      Axios.post(`${this.serverUrl}/api/signup`, this.user)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.accountVisible = true;
            this.saveToken();
            this.currentView = this.VIEW_HOME;
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    signout() {
      this.removeToken();
    },

    searchMovie() {
      this.movieSelectList = [];

      Axios.get(`${this.serverUrl}/search/${this.movieSearchText}`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => result.results)
        .then((result) => {
          if (result && result.length > 0) {
            this.movieSelectList = result;
          } else {
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    loadHome() {
      this.homeData = [];

      Axios.get(`${this.serverUrl}/store/top`)
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.homeData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    removeToken() {
      localStorage.removeItem("token");
      this.accountToken = "";
      this.favoriteMovies = [];
      this.movieSelect = [];
      this.accountVisible = false;
      this.loginVisible = true;
      this.favoriteVisible = true;
      this.movieSearchText = "";
      this.menuBarSearchText = "";
    },

    checkUserToken() {
      this.accountToken = localStorage.getItem("token");
      if (this.accountToken != null) {
        this.accountVisible = true;
      }
    },

    handleError(error) {
      if (
        error.response.status &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        this.removeToken();
        this.popupMessage = "Login expired";
      } else {
        this.popupMessage = "Could not process request";
      }

      this.popupVisible = true;
    },

    handleMessage(message) {
      this.popupMessage = message;
      this.popupVisible = true;
    },

    saveToken() {
      localStorage.setItem("token", this.accountToken);
    },
  };
}
