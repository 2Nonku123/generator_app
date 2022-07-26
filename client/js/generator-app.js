import Axios from "axios";
import Joi from "joi";
import Location from "./location";

export default function GeneratorApp() {
  return {
    serverUrl: "http://localhost:4017",
    //serverUrl: "",
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

    VIEW_PROFILE_DETAILS: 900,
    VIEW_PROFILE_ADDRESS: 901,
    VIEW_PROFILE_ADD_ADDRESS: 902,
    VIEW_PROFILE_EDIT_ADDRESS: 903,

    VIEW_ORDERS: 32,
    VIEW_ORDERS_LIST: 301,
    VIEW_ORDERS_ITEMS: 302,
    VIEW_PASSWORD: 11,
    VIEW_CART: 15,
    VIEW_LOADING: 6000,
    VIEW_CHECKOUT: 60,

    VIEW_PRODUCT_CATEGORY: 200,
    VIEW_PRODUCT_ITEMS: 201,

    VIEW_PRODUCT_DESCRIPTION: 202,
    ////////////

    currentView: this.VIEW_HOME,
    lastView: 0,

    currentSubView: 0,
    isAdmin: false,

    addressProvince: 1,
    addressCity: 1,
    addressSuburb: 1,

    provinceData: [],
    cityData: [],
    suburbData: [],

    populateLocation() {
      this.provinceData = this.getProvince();
      this.cityData = this.getCity();

      this.suburbData = this.getSuburb();
    },

    updateProvince() {
      this.cityData = this.getCity();
      this.suburbData = [];
      //this.suburbData = this.getSuburb();
    },

    updateCity() {
      this.suburbData = [];
      this.suburbData = this.getSuburb();
    },

    orderOption: 1,
    deliveryOption: 1,
    deliveryText: "",

    userLogginInfo: { first_name: "", lastname: "", user_type: "", user_id: 0 },

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
      newPassword: "",
      confirmPassword: "",
    },

    addressData: [],
    addressSelect: {
      id: 0,
      housenumber: 0,
      street: "",
      suburb: "",
      city: "",
      province: "",
      postal_code: 0,
    },

    updateOrderOption(id) {
      this.deliveryText = "";
      this.addressData = [];
      this.addressSelect = {
        id: 0,
        housenumber: 0,
        street: "",
        suburb: "",
        city: "",
        province: "",
        postal_code: 0,
      };

      //address
      this.orderOption = id;
      if (id == 2) {
        this.updateDeliveryOption(1);
      }
    },

    updateDeliveryOption(id) {
      this.addressData = [];
      this.deliveryText = "";

      this.addressSelect = {
        id: 0,
        housenumber: 0,
        street: "",
        suburb: "",
        city: "",
        province: "",
        postal_code: 0,
      };

      switch (id) {
        case 1:
          this.loadAddress();
          break;
      }
      this.deliveryOption = id;
    },

    accountName: "",

    orderData: [],
    orderProductsData: [],

    homeData: [],
    categoryData: [],
    categoryProductsData: [],
    searchData: [],
    cartData: [],

    addressData: [],

    searchText: "",

    cartInfomation: {
      is_delivery: 0,
      delivery_address: "",
      card_number: 0,
      card_month: 0,
      card_year: 0,
      card_cvc: 0,
    },

    selectedProduct: {
      id: 0,
      product_image: "",
      description: "",
      price: 0,
      quantity: 0,
      product_name: "",
      is_rentalble: false,
      rental_duration: 0,
      rental_duration_type: 0,
      selectd_quantity: 0,
      calculated_price: 0,
    },

    selectedOrder: {
      id: 0,
      order_date: "",
      order_total: "",
      order_items: 0,
      order_status: "",
    },

    orderItems: [],

    init() {
      this.checkUserToken();

      this.currentView = this.VIEW_HOME;
      this.loadHome();

      this.sortLocation();
    },

    sortLocation() {
      Location.city = Location.city.sort((x, y) =>
        x.CityName < y.CityName ? -1 : x.CityName > y.CityName ? 1 : 0
      );
      Location.province = Location.province.sort((x, y) =>
        x.ProvinceName < y.ProvinceName
          ? -1
          : x.ProvinceName > y.ProvinceName
          ? 1
          : 0
      );
      Location.suburb = Location.suburb.sort((x, y) =>
        x.SuburbName < y.SuburbName ? -1 : x.SuburbName > y.SuburbName ? 1 : 0
      );
    },

    ////////////////// Open View Functions
    openHome() {
      this.currentView = this.VIEW_HOME;
      this.cleanUp();
      this.loadHome();
    },

    openSignIn() {
      this.currentView = this.VIEW_SIGNIN;
    },
    openSignUp() {
      this.currentView = this.VIEW_SIGNUP;
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

    openProducts(category_id) {
      this.currentView = this.VIEW_PRODUCT;
      this.currentSubView = this.VIEW_PRODUCT_ITEMS;
      this.cleanUp();
      this.loadProducts(category_id);
    },

    openSearch() {
      if (this.searchText.trim().length >= 3) {
        this.currentView = this.VIEW_SEARCH;
        this.cleanUp();
        this.loadSearchResults(this.searchText);
      } else {
        this.handleMessage("Please enter 3 or more characters to search for");
      }
    },

    openProductView(productItem) {
      this.selectedProduct = productItem;
      this.lastView = this.currentView;

      this.currentView = this.VIEW_PRODUCT_DESCRIPTION;
    },

    openShoppingCart() {
      this.cleanUp();
      this.currentView = this.VIEW_CART;
      this.loadCart();
    },

    openProfile() {
      this.cleanUp();
      this.currentView = this.VIEW_PROFILE;
      this.currentSubView = this.VIEW_PROFILE_DETAILS;
      this.loadProfile();
    },

    openAddress() {
      this.cleanUp();
      this.currentView = this.VIEW_PROFILE;
      this.currentSubView = this.VIEW_PROFILE_ADDRESS;
      this.loadAddress();
    },

    openAddressAdd() {
      this.cleanUp();
      this.currentView = this.VIEW_PROFILE;
      this.currentSubView = this.VIEW_PROFILE_ADD_ADDRESS;

      this.populateLocation();

      this.addressProvince = 1;
      this.addressCity = 1;
      this.addressSuburb = 1;
    },

    openAddressEdit(addressSelect) {
      this.cleanUp();
      this.addressSelect = addressSelect;
      this.currentView = this.VIEW_PROFILE;
      this.currentSubView = this.VIEW_PROFILE_EDIT_ADDRESS;
      this.populateLocation();
      this.addressProvince =
        Location.province.filter(
          (x) => x.ProvinceName == addressSelect.province
        )[0].province_id ?? 3;
      this.addressCity =
        Location.city.filter((x) => x.CityName == addressSelect.city)[0]
          .city_id ?? 1;
      this.addressSuburb =
        Location.suburb.filter((x) => x.SuburbName == addressSelect.suburb)[0]
          .suburb_id ?? 1;
      this.populateLocation();
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

    openCheckout() {
      this.currentView = this.VIEW_CHECKOUT;
      this.deliveryOption = 0;
      this.orderOption = 1;
      this.updateOrderOption(1);
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

      Axios.post(`${this.serverUrl}/api/login`, loginInfo)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.saveToken();
            this.getUserProfile();
            this.accountVisible = true;
            this.openHome();
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
            this.getUserProfile();
            this.openHome();
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

    loadAddress() {
      this.addressData = [];

      Axios.get(`${this.serverUrl}/profile/address`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.addressData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    fixAddress() {
      const province =
        Location.province.filter(
          (x) => x.province_id == this.addressProvince
        )[0].ProvinceName ?? "";
      const city =
        Location.city.filter((x) => x.city_id == this.addressCity)[0]
          .CityName ?? "";

      const suburb =
        Location.suburb.filter((x) => x.suburb_id == this.addressSuburb)[0]
          .SuburbName ?? "";

      this.addressSelect.city = city;
      this.addressSelect.province = province;
      this.addressSelect.suburb = suburb;
    },
    addAddress() {
      this.fixAddress();
      Axios.post(`${this.serverUrl}/profile/address`, this.addressSelect, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.openAddress();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    editAddress() {
      this.fixAddress();
      Axios.put(`${this.serverUrl}/profile/address`, this.addressSelect, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.openAddress();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    removeAddress(id) {
      Axios.delete(`${this.serverUrl}/profile/address/${id}`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.openAddress();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    loadCategory() {
      this.categoryData = [];

      Axios.get(`${this.serverUrl}/store/category`)
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.categoryData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadProducts(category_id) {
      this.categoryProductsData = [];

      Axios.get(`${this.serverUrl}/store/category/${category_id}`)
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.categoryProductsData = result;
          }
        })
        .catch((error) => this.handleError(error));
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

    loadSearchResults() {
      this.searchData = [];

      Axios.get(`${this.serverUrl}/store/search/${this.searchText}`)
        .then((result) => result.data)
        .then((result) => {
          //alert(JSON.stringify(result));
          if (result && result.length > 0) {
            this.searchData = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadProfile() {
      Axios.get(`${this.serverUrl}/profile`, {
        headers: { authorization: `${this.accountToken}` },
      })
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
        `${this.serverUrl}/profile/personal`,
        {
          first_name: this.profileData.first_name,
          lastname: this.profileData.lastname,
        },
        {
          headers: { authorization: `${this.accountToken}` },
        }
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
        `${this.serverUrl}/profile/contact`,
        {
          contact_number: this.profileData.contact_number,
          email_address: this.profileData.email_address,
        },
        {
          headers: { authorization: `${this.accountToken}` },
        }
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
        `${this.serverUrl}/profile/password`,
        {
          confirm_password: this.profileData.confirmPassword,
          password: this.profileData.newPassword,
        },
        {
          headers: { authorization: `${this.accountToken}` },
        }
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

      Axios.get(`${this.serverUrl}/order`, {
        headers: { authorization: `${this.accountToken}` },
      })
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

      Axios.get(`${this.serverUrl}/order/${this.selectedOrder.id}/items`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.orderItems = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    loadCart() {
      this.cartData = [];

      Axios.get(`${this.serverUrl}/cart`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.cartData = result;
            this.selectedOrder.order_total = 0;
            this.selectedOrder.order_items = 0;
            try {
              this.cartData.forEach((element) => {
                this.selectedOrder.order_total += new Number(element.sub_total);
                this.selectedOrder.order_items += new Number(
                  element.product_quantity
                );
              });
            } catch (error) {
              alert(error);
            }
          }
        })
        .catch((error) => this.handleError(error));
    },

    cartAdd() {
      Axios.post(
        `${this.serverUrl}/cart`,
        {
          product_id: this.selectedProduct.id,
          quantity: this.selectedProduct.selected_quantity,
        },
        {
          headers: { authorization: `${this.accountToken}` },
        }
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
            // Reload Cart
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    cartUpdate(cart_item) {
      Axios.put(
        `${this.serverUrl}/cart`,
        { product_id: cart_item.id, quantity: cart_item.product_quantity },
        {
          headers: { authorization: `${this.accountToken}` },
        }
      )
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
            this.loadCart();
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    cartDelete(cart_item) {
      Axios.delete(`${this.serverUrl}/cart/${cart_item.id}`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.loadCart();
          }
          this.handleMessage(result.message);
        })
        .catch((error) => this.handleError(error));
    },

    cartClear() {
      Axios.delete(`${this.serverUrl}/cart/`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
            this.loadCart();
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    cartCompleteOrder() {
      this.cartInfomation.is_delivery = this.orderOption == 2 ? 1 : 0;

      if (this.orderOption == 2 && this.deliveryOption == 1) {
        if (this.addressSelect.id == 0) {
          this.handleMessage("Please select an address");
          return;
        }
        this.cartInfomation.delivery_address = `
        House Number: ${this.addressSelect.housenumber} , \r\n
        Street Name: ${this.addressSelect.street} , \r\n
        Suburb: ${this.addressSelect.suburb} , \r\n
        City: ${this.addressSelect.city} , \r\n
        Province: ${this.addressSelect.province} , \r\n
        Postal Code: ${this.addressSelect.postal_code} , \r\n
        `;
      } else {
        this.cartInfomation.delivery_address = this.deliveryText;
      }

      Axios.post(`${this.serverUrl}/cart/complete/card`, this.cartInfomation, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result.status == "success") {
            this.handleMessage(result.message);
            // Reload Cart
            this.openOrders();
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => this.handleError(error));
    },

    addCartQuantity(cart_item, quantity) {
      let newQuantity = quantity + cart_item.product_quantity;

      if (newQuantity < 1 || newQuantity > cart_item.quantity) {
        cart_item.product_quantity = cart_item.product_quantity;
      } else {
        cart_item.product_quantity = newQuantity;
      }

      this.updateCartQuantity(cart_item);
    },

    updateCartQuantity(cart_item) {
      cart_item.sub_total =
        cart_item.product_price * cart_item.product_quantity;
    },

    removeToken() {
      this.cleanUp();
      localStorage.removeItem("token");
      this.accountToken = "";
      this.accountVisible = false;
      this.resetUser();
      this.openHome();
    },

    checkUserToken() {
      this.accountToken = localStorage.getItem("token");

      if (this.accountToken != null) {
        this.getUserProfile();
        this.accountVisible = true;
      }
    },

    getUserProfile() {
      try {
        const getInfo = this.getTokenInfo();

        if (getInfo != null && getInfo.user_type != null) {
          this.isAdmin = getInfo.user_type == "admin";
        }
      } catch (e) {
        this.accountVisible = false;
      }
    },
    ///////////////////////////////////////////////

    addSelectedQuantity(quantity) {
      let newQuantity = quantity + this.selectedProduct.selected_quantity;

      if (newQuantity < 0 || newQuantity > this.selectedProduct.quantity) {
        this.selectedProduct.selected_quantity =
          this.selectedProduct.selected_quantity;
      } else {
        this.selectedProduct.selected_quantity = newQuantity;
      }

      this.updateSelectedPrice();
    },

    updateSelectedPrice() {
      this.selectedProduct.calculated_price =
        this.selectedProduct.price * this.selectedProduct.selected_quantity;
    },

    cleanUp() {
      this.cartData = [];

      this.user.first_name = "";
      this.user.lastname = "";
      this.user.password = "";
      this.user.user_name = "";
      this.user.email_address = "";
      this.user.contact_number = "";
      this.accountName = "";
      this.orderData = [];
      this.orderProductsData = [];

      this.homeData = [];
      this.searchData = [];
      this.cartData = [];
      this.categoryData = [];
      this.addressData = [];
      this.categoryProductsData = [];

      this.addressData = [];

      this.addressSelect = {
        id: 0,
        housenumber: 0,
        street: "",
        suburb: "",
        city: "",
        province: "",
        postal_code: 0,
      };

      this.selectedProduct = {
        id: 0,
        product_image: "",
        description: "",
        price: 0,
        quantity: 0,
        product_name: "",
        is_rentalble: false,
        rental_duration: 0,
        rental_duration_type: 0,
        selectd_quantity: 0,
        calculated_price: 0,
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
      };
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

    /// new address handler

    getProvince() {
      const province = Location.province.sort((x) => x.ProvinceName);

      return province;
    },

    getCity() {
      const city = Location.city
        .filter((x) => x.province_id == this.addressProvince)
        .sort((x) => x.CityName);

      return city;
    },

    getSuburb() {
      let suburb = Location.suburb
        .filter((x) => x.city_id == this.addressCity)
        .sort((x) => x.SuburbName);

      return suburb;
    },

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

    saveToken() {
      localStorage.setItem("token", this.accountToken);
    },
  };
}