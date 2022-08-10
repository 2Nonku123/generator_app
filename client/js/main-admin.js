import GeneratorApp from "./generator-admin-app";
import Alpine from "alpinejs";

window.Alpine = Alpine;
Alpine.data("generatorApp", GeneratorApp);
Alpine.start();