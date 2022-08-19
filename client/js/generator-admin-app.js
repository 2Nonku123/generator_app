import Axios from "axios";
import Joi from "joi";

export default function GeneratorAdminApp() {
  return {
    serverUrl: "http://localhost:4017",
    //serverUrl: "",
    /////////////////
    // View Constants
    STORE_NAME: "Genx Shop",
    VIEW_HOME: 1,
    VIEW_PRODUCT: 2,

    VIEW_SIGNIN: 6,
    VIEW_SIGNUP: 7,
    VIEW_PROFILE: 10,
    VIEW_ORDERS: 32,

    VIEW_ORDERS_LIST: 301,
    VIEW_ORDERS_ITEMS: 302,
    VIEW_ORDERS_SEARCH: 303,

    VIEW_PASSWORD: 11,

    VIEW_LOADING: 6000,

    VIEW_PRODUCT_CATEGORY: 200,
    VIEW_PRODUCT_ITEMS: 201,
    VIEW_PRODUCT_SEARCH: 203,

    VIEW_PRODUCT_LIST: 204,
    VIEW_PRODUCT_ADD: 205,
    VIEW_PRODUCT_EDIT: 206,
    VIEW_PRODUCT_CATEGORY_EDIT: 207,

    VIEW_USER: 20,
    VIEW_USER_ALL: 440,
    VIEW_USER_SEARCH: 441,
    VIEW_USER_NEW: 442,
    VIEW_USER_EDIT: 443,

    VIEW_REPORT: 400,

    VIEW_REPORT_SALES_PRODUCT_TOP5: 401,
    VIEW_REPORT_SALES_PRODUCT_HISTORY: 402,
    VIEW_REPORT_SALES_PRODUCT_DATE: 403,

    VIEW_REPORT_SALES_USER_TOP5: 411,
    VIEW_REPORT_SALES_DATE: 412,
    VIEW_REPORT_SALES_USER_DATE: 413,

    VIEW_REPORT_SALES_CATEGORY_TOP5: 421,
    VIEW_REPORT_SALES_CATEGORY_HISTORY: 422,
    VIEW_REPORT_SALES_CATEGORY_DATE: 423,

    VIEW_REPORT_PRODUCT: 431, // Show in stock, out of stock and category
    VIEW_REPORT_USER: 441, // show locked, unlocked , user types
    //////////////////////////////////////////////////

    isAdmin: false,
    currentView: this.VIEW_HOME,
    currentCategory: { id: 0, name: "", image: "" },
    lastView: 0,
    orderSearchType: "id",
    uploadValue: "",
    userLogginInfo: {
      first_name: "",
      lastname: "",
      user_type: "",
      user_id: 0,
    },
    currentSubView: 0,

    user: {
      user_name: "",
      password: "",
      first_name: "",
      lastname: "",
      email_address: "",
      contact_number: "",
    },

    is_Loading: false,
    page_loaded: true,

    accountToken: "",

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
      newPassword: "",
      confirmPassword: "",
    },

    userEdit: {
      id: 0,
      first_name: "",
      lastname: "",
      user_name: "",
      email_address: "",
      contact_number: "",
      user_type_id: 1,
      locked: false,
    },

    userAdd: {
      first_name: "",
      lastname: "",
      user_name: "",
      password: "",
      email_address: "",
      contact_number: "",
      user_type_id: 1,
    },

    stats: { user_count: 0, product_count: 0, order_count: 0 },

    addressData: [],
    addressSelect: {
      id: 0,
      house_number: 0,
      street_name: "",
      province: "",
      postal_code: 0,
    },

    accountName: "",

    orderData: [],
    orderProductsData: [],

    homeData: [],
    categoryData: [],
    categoryProductsData: [],
    searchData: [],
    cartData: [],
    orderSearchData: [],

    addressData: [],

    searchText: "",
    userData: [],
    userSearchData: [],

    selectedProduct: {
      id: 0,
      product_image: "",
      product_type: "",
      description: "",
      price: 0,
      quantity: 0,
      product_name: "",
      available: true,
      is_rentalble: false,
      rental_duration: 0,
      rental_duration_type: 0,
      product_type_id: 1,
    },

    selectedOrder: {
      id: 0,
      order_date: "",
      order_total: "",
      order_items: 0,
      order_status: "",
      order_status_id: 0,
    },

    orderItems: [],

    init() {
      this.checkUserToken();
      if (this.accountToken != null && this.accountToken.length > 6) {
        this.currentView = this.VIEW_HOME;
        this.loadHome();
      } else {
        this.currentView = this.VIEW_SIGNIN;
      }
    },

    ////////////////// Open View Functions
    openHome() {
      this.currentView = this.VIEW_HOME;
      this.cleanUp();
      this.loadHome();
    },

    openSignIn() {
      this.currentView = this.VIEW_SIGNIN;
      this.cleanUp();
    },

    openAbout() {
      this.currentView = this.VIEW_ABOUT;
    },

    openCategories() {
      this.currentView = this.VIEW_PRODUCT;
      this.currentSubView = this.VIEW_PRODUCT_CATEGORY;
      this.cleanUp();
      this.loadCategory();
    },

    openCategoryEdit(category) {
      this.cleanUp();
      this.currentCategory = category;
      this.currentView = this.VIEW_PRODUCT;
      this.currentSubView = this.VIEW_PRODUCT_CATEGORY_EDIT;
    },

    openProducts(category) {
      this.currentCategory = category;
      this.currentView = this.VIEW_PRODUCT;
      this.currentSubView = this.VIEW_PRODUCT_ITEMS;
      this.cleanUp();
      this.loadProducts(category.id);
    },

    openSearchProduct() {
      this.currentSubView = this.VIEW_PRODUCT_SEARCH;
      this.currentView = this.VIEW_PRODUCT;
      this.cleanUp();
    },

    openAddProduct() {
      this.currentSubView = this.VIEW_PRODUCT_ADD;
      this.currentView = this.VIEW_PRODUCT;
      this.cleanUp();
    },

    openEditProduct(product) {
      this.cleanUp();
      this.selectedProduct = product;
      this.currentSubView = this.VIEW_PRODUCT_EDIT;
      this.currentView = this.VIEW_PRODUCT;
    },

    openProfile() {
      this.cleanUp();
      this.currentView = this.VIEW_PROFILE;
      this.loadProfile();
    },
    openOrders() {
      this.currentView = this.VIEW_ORDERS;
      this.currentSubView = this.VIEW_ORDERS_LIST;
      this.cleanUp();

      this.loadOrders();
    },

    openOrderItems(order_data) {
      this.cleanUp();
      this.selectedOrder = order_data;
      this.currentView = this.VIEW_ORDERS;
      this.currentSubView = this.VIEW_ORDERS_ITEMS;

      this.loadOrderItems();
    },

    openUsers() {
      this.currentView = this.VIEW_USER;
      this.currentSubView = this.VIEW_USER_ALL;
      this.cleanUp();
      this.loadUsers();
    },

    openUserSearch() {
      this.currentView = this.VIEW_USER;
      this.currentSubView = this.VIEW_USER_SEARCH;
      this.cleanUp();
    },

    openNewUser() {
      this.cleanUp();
      this.currentView = this.VIEW_USER;
      this.currentSubView = this.VIEW_USER_NEW;
    },

    openEditUser(user) {
      if (this.userLogginInfo.user_id == user.id) {
        this.handleMessage("Cannot edit your own account");
        return;
      }

      this.userEdit = {
        id: user.id,
        first_name: user.first_name,
        lastname: user.lastname,
        user_name: user.user_name,
        email_address: user.email_address,
        contact_number: user.contact_number,
        user_type_id: user.user_type_id,
        locked: user.locked,
      };
      this.currentView = this.VIEW_USER;
      this.currentSubView = this.VIEW_USER_EDIT;
      this.cleanUp();
    },

    openOrderSearch() {
      this.cleanUp();
      this.searchText = "";
      this.orderSearchType = "id";
      this.currentView = this.VIEW_ORDERS;
      this.currentSubView = this.VIEW_ORDERS_SEARCH;
    },

    /////////////////////////////////

    //// Process Functions
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

      Axios.post(`${this.serverUrl}/api/admin/login`, loginInfo)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.saveToken();
            this.accountVisible = true;
            this.openHome();
            this.getUserProfile();
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

    loadCategory() {
      this.categoryData = [];

      Axios.get(`${this.serverUrl}/admin/category`, this.getTokenHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.categoryData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    editCategory() {
      Axios.put(
        `${this.serverUrl}/admin/category`,
        { id: this.currentCategory.id, name: this.currentCategory.name },
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.openCategories();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    loadProducts(category_id) {
      this.categoryProductsData = [];

      Axios.get(
        `${this.serverUrl}/admin/category/product/${category_id}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.categoryProductsData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    addProduct() {
      Axios.post(
        `${this.serverUrl}/admin/product`,
        this.selectedProduct,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.openProducts(this.currentCategory);
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    editProduct() {
      Axios.put(
        `${this.serverUrl}/admin/product`,
        this.selectedProduct,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.openProducts(this.currentCategory);
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    removeProduct(product_id) {
      Axios.delete(
        `${this.serverUrl}/admin/product/${product_id}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            if (this.currentSubView == this.VIEW_PRODUCT_SEARCH) {
              this.loadProductSearch();
            } else {
              this.openProducts(this.currentCategory);
            }
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          alert(error);
          this.handleError(error);
        });
    },

    loadHome() {
      Axios.get(`${this.serverUrl}/admin/stats`, this.getTokenHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result != null) {
            this.stats = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadProductSearch() {
      if (this.searchText.trim().length > 3) {
        this.handleMessage("Please enter 3 or more characters to search for");
      }

      this.searchData = [];

      Axios.get(
        `${this.serverUrl}/admin/product/search/${this.searchText}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.searchData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadProfile() {
      Axios.get(`${this.serverUrl}/admin/profile`, this.getTokenHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result) {
            this.profileData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    updateProfilePersonal() {
      Axios.put(
        `${this.serverUrl}/admin/profile/personal`,
        {
          first_name: this.profileData.first_name,
          lastname: this.profileData.lastname,
        },
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    updateProfileContact() {
      Axios.put(
        `${this.serverUrl}/admin/profile/contact`,
        {
          contact_number: this.profileData.contact_number,
          email_address: this.profileData.email_address,
        },
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    updateProfilePassword() {
      Axios.put(
        `${this.serverUrl}/admin/profile/password`,
        {
          confirm_password: this.profileData.confirmPassword,
          password: this.profileData.newPassword,
        },
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
      this.profileData.newPassword = "";
      this.profileData.confirmPassword = "";
    },

    loadOrders() {
      this.orderData = [];

      Axios.get(`${this.serverUrl}/admin/order`, this.getTokenHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.orderData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadOrderItems() {
      this.orderItems = [];

      Axios.get(
        `${this.serverUrl}/admin/order/${this.selectedOrder.order_id}/items`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.orderItems = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadUsers() {
      this.userData = [];

      Axios.get(`${this.serverUrl}/admin/user`, this.getTokenHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.userData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadSearchUsers() {
      if (this.searchText.trim().length < 3) {
        this.handleMessage("Please enter 3 or more characters to search for");
        return;
      }

      this.userSearchData = [];

      Axios.get(
        `${this.serverUrl}/admin/user/search/${this.searchText}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.userSearchData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    addUser() {
      Axios.post(
        `${this.serverUrl}/admin/user`,
        this.userAdd,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.searchText = this.userAdd.user_name;
            this.openUserSearch();
            this.loadSearchUsers();
            this.handleMessage(result.message);
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    editUser() {
      Axios.put(
        `${this.serverUrl}/admin/user`,
        this.userEdit,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.searchText = this.userEdit.user_name;
            this.openUserSearch();
            this.loadSearchUsers();

            this.handleMessage(result.message);
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    removeUser(user_id) {
      if (this.userLogginInfo.user_id == user_id) {
        this.handleMessage("Cannot remove your own account");
        return;
      }

      Axios.delete(
        `${this.serverUrl}/admin/user/${user_id}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.openUsers();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          alert(error);
          this.handleError(error);
        });
    },

    resetUserPassword() {
      Axios.put(
        `${this.serverUrl}/admin/user/password/reset/${this.userEdit.id}`,
        this.userEdit,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.searchText = this.userEdit.user_name;
            this.openUserSearch();
            this.loadSearchUsers();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    searchOrders() {
      switch (this.orderSearchType) {
        case "id":
          if (this.searchText.trim().length < 1) {
            this.handleMessage("Please enter a number");
            return;
          }
          break;

        case "name":
        default:
          if (this.searchText.trim().length < 3) {
            this.handleMessage(
              "Please enter 3 or more characters to search for"
            );
            return;
          }
          break;
      }

      this.orderSearchData = [];

      Axios.get(
        `${this.serverUrl}/admin/order/search/${this.orderSearchType}/${this.searchText}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.orderSearchData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    setOrderstatus(status) {
      Axios.put(
        `${this.serverUrl}/admin/order/${this.selectedOrder.order_id}/status`,
        { status_id: status },
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          this.handleMessage(result.message);
          if (result.status == "success") {
            this.reloadOrder();
          }
        })
        .catch((error) => this.handleError(error));
    },

    reloadOrder() {
      Axios.get(
        `${this.serverUrl}/admin/order/${this.selectedOrder.order_id}`,
        this.getTokenHeader()
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.selectedOrder = result.order;
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    /// https://stackoverflow.com/a/66964246

    uploadCategory(e) {
      let url = `${this.serverUrl}/admin/category/${this.currentCategory.id}/image`;
      let file = e.target.files[0];

      // this.uploadFile(url, file);
      let formData = new FormData();
      formData.append("image", file);

      Axios.post(url, formData, this.getTokenImageHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.openCategories();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    uploadProduct(e) {
      let url = `${this.serverUrl}/admin/product/${this.selectedProduct.id}/image`;
      let file = e.target.files[0];

      // this.uploadFile(url, file);
      let formData = new FormData();
      formData.append("image", file);

      Axios.post(url, formData, this.getTokenImageHeader())
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.openProducts(this.currentCategory);
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    ///////////////////////////////////////////

    getTokenImageHeader() {
      return {
        headers: {
          authorization: `${this.accountToken}`,
          "Content-Type": "multipart/form-data",
        },
      };
    },

    getTokenHeader() {
      return {
        headers: { authorization: `${this.accountToken}` },
      };
    },

    removeToken() {
      this.cleanUp();
      localStorage.removeItem("token");
      this.accountToken = "";
      this.accountVisible = false;
      this.currentView = this.VIEW_SIGNIN;
      this.resetUser();
      this.isAdmin = false;
    },

    checkUserToken() {
      this.accountToken = localStorage.getItem("token");
      if (this.accountToken != null) {
        this.accountVisible = true;
        this.getUserProfile();
      }
    },
    ///////////////////////////////////////////////

    cleanUp() {
      this.user.first_name = "";
      this.user.lastname = "";
      this.user.password = "";
      this.user.user_name = "";
      this.user.email_address = "";
      this.user.contact_number = "";
      this.searchText = "";
      this.accountName = "";
      this.orderData = [];
      this.orderSearchData = [];
      this.orderProductsData = [];

      this.stats = { user_count: 0, product_count: 0, order_count: 0 };

      this.addressData = [];
      this.categoryProductsData = [];
      this.userData = [];
      this.userSearchData = [];

      switch (this.currentSubView) {
        case this.VIEW_PRODUCT_ITEMS:
        case this.VIEW_PRODUCT_SEARCH:
        case this.VIEW_PRODUCT_ADD:
        case this.VIEW_PRODUCT_EDIT:
          break;

        default:
          this.categoryData = [];
          break;
      }

      this.uploadValue = "";

      this.selectedProduct = {
        id: 0,
        product_image: "",
        product_type: "",
        description: "",
        price: 0,
        quantity: 0,
        product_name: "",
        available: true,
        is_rentalble: false,
        rental_duration: 0,
        rental_duration_type: 0,
        product_type_id:
          this.currentCategory.id > 0 ? this.currentCategory.id : 1,
      };

      this.profileData = {
        user_name: "",
        first_name: "",
        lastname: "",
        date_registred: "",
        email_address: "",
        countact_number: "",
        newPassword: "",
        confirmPassword: "",
      };

      this.selectedOrder = {
        id: 0,
        order_date: "",
        order_total: "",
        order_items: 0,
        order_status: "",
        order_status_id: 0,
      };

      this.userAdd = {
        first_name: "",
        lastname: "",
        user_name: "",
        password: "",
        email_address: "",
        contact_number: "",
        user_type_id: 1,
      };
    },

    handleError(error) {
      if (
        error.response.status &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        this.removeToken();
        this.popupMessage = "Login expired";
        this.currentView = this.VIEW_SIGNIN;
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

    ////////////////////////

    getUserProfile() {
      this.resetUser();
      try {
        const getInfo = this.getTokenInfo();

        if (getInfo != null && getInfo.user_type != null) {
          this.isAdmin = getInfo.user_type == "admin";
        }
        this.userLogginInfo = getInfo;
      } catch (e) {
        this.accountVisible = false;
      }
    },

    getTokenInfo() {
      const token = this.accountToken;
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    },

    resetUser() {
      this.userLogginInfo = {
        first_name: "",
        lastname: "",
        user_type: "",
        user_id: 0,
      };
    },
  };
}