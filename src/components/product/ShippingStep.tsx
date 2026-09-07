"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  MapPin, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowLeft,
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  Building,
  ShieldCheck,
  CreditCard,
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/currency";
import { Link, useRouter } from "@/i18n/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";

// --- TRANSLATIONS DICTIONARY WITH HIGH PSYCHOLOGY Polish/English COPY ---
const translations = {
  pl: {
    stepper: ["Koszyk", "Dostawa", "Płatność", "Podsumowanie"],
    urgency: "Produkty w Twoim koszyku są zarezerwowane przez",
    minutes: "min",
    title: "Metoda dostawy i adres",
    contactTitle: "1. Dane odbiorcy przesyłki",
    deliveryMethodTitle: "2. Metoda dostawy",
    addressTitle: "3. Adres doręczenia",
    fullname: "Imię i nazwisko",
    fullnamePlaceholder: "np. Jan Kowalski",
    email: "Adres e-mail",
    emailPlaceholder: "np. jan.kowalski@gmail.com",
    phone: "Numer telefonu",
    phonePlaceholder: "np. 500 600 700",
    street: "Ulica i numer domu/mieszkania",
    streetPlaceholder: "np. Marszałkowska 104/12",
    zip: "Kod pocztowy",
    zipPlaceholder: "np. 00-001",
    city: "Miejscowość",
    cityPlaceholder: "np. Warszawa",
    invoiceCheckbox: "Chcę otrzymać fakturę VAT na firmę",
    companyName: "Pełna nazwa firmy",
    companyNamePlaceholder: "np. Acme Sp. z o.o.",
    nip: "Numer NIP",
    nipPlaceholder: "10-cyfrowy NIP firmy",
    paczkomatPlaceholder: "Wpisz kod Paczkomatu lub miasto/ulicę (np. WAW...)",
    selectedLocker: "Wybrany Paczkomat",
    backToCart: "Wróć do koszyka",
    proceedToPayment: "Przejdź do bezpiecznej płatności",
    summary: "Podsumowanie zamówienia",
    total: "Razem do zapłaty",
    shipping: "Koszt wysyłki",
    subtotal: "Wartość produktów",
    vatIncluded: "Ceny zawierają podatek VAT",
    vatInvoiceIncluded: "Faktura zostanie wysłana drogą elektroniczną",
    deliveryTomorrow: "Kup w ciągu {time} – wysyłka jeszcze dzisiaj!",
    fieldRequired: "To pole jest wymagane",
    fieldInvalid: "Niepoprawny format",
    nipInvalid: "Niepoprawny numer NIP (błąd sumy kontrolnej)",
    trustText: "Bezpieczne szyfrowanie SSL. Twoje dane są chronione.",
    courierName: "Kurier InPost / DPD (Szybka dostawa do drzwi)",
    lockerName: "Paczkomat InPost 24/7 (Odbierz kiedy chcesz)",
    orlenName: "ORLEN Paczka (Odbiór w punkcie / kiosku)",
    deliveryTimeCourier: "Doręczenie w 1-2 dni robocze",
    deliveryTimeLocker: "Dostawa już jutro rano!",
    deliveryTimeOrlen: "Odbiór za 2 dni robocze",
    mostPopularBadge: "Najpopularniejsza",
    searchLockerPrompt: "Wpisz lokalizację powyżej, aby znaleźć punkt",
    selectButton: "Wybierz",
    changeLockerButton: "Zmień punkt",
    redirecting: "Łączenie z bezpieczną bramką płatności...",
    redirectingSubtitle: "Za chwilę nastąpi przekierowanie do bezpiecznej płatności BLIK / Kartą / Google Pay. (Przelewy24 już wkrótce!)",
    autofillNotification: "Wykryliśmy Twoje zapisane dane dostawy z poprzedniej wizyty! ✨",
    autofillButton: "Uzupełnij dane automatycznie",
    autofillSuccess: "Uzupełniono dane automatycznie! 🚀",
    clearFields: "Wyczyść pola",
    selectLockerError: "Proszę wybrać Paczkomat z listy",
    selectOrlenError: "Proszę wybrać punkt ORLEN Paczka",
  },
  en: {
    stepper: ["Cart", "Shipping", "Payment", "Summary"],
    urgency: "Products in your cart are reserved for",
    minutes: "min",
    title: "Delivery Method & Address",
    contactTitle: "1. Delivery Recipient Details",
    deliveryMethodTitle: "2. Delivery Method",
    addressTitle: "3. Delivery Address",
    fullname: "Full Name",
    fullnamePlaceholder: "e.g. John Doe",
    email: "Email Address",
    emailPlaceholder: "e.g. john.doe@example.com",
    phone: "Phone Number",
    phonePlaceholder: "e.g. 500 600 700",
    street: "Street & House/Apartment number",
    streetPlaceholder: "e.g. Marszalkowska 104/12",
    zip: "Postal Code",
    zipPlaceholder: "e.g. 00-001",
    city: "City",
    cityPlaceholder: "e.g. Warsaw",
    invoiceCheckbox: "I need a company VAT invoice",
    companyName: "Full Company Name",
    companyNamePlaceholder: "e.g. Acme Ltd.",
    nip: "NIP / Tax ID",
    nipPlaceholder: "10-digit Polish Tax ID",
    paczkomatPlaceholder: "Enter locker code or city/street (e.g. WAW...)",
    selectedLocker: "Selected Parcel Locker",
    backToCart: "Back to cart",
    proceedToPayment: "Proceed to secure payment",
    summary: "Order Summary",
    total: "Total to pay",
    shipping: "Shipping cost",
    subtotal: "Products value",
    vatIncluded: "Prices include VAT",
    vatInvoiceIncluded: "The invoice will be sent electronically",
    deliveryTomorrow: "Order in {time} – dispatch today!",
    fieldRequired: "This field is required",
    fieldInvalid: "Invalid format",
    nipInvalid: "Invalid Polish NIP (checksum error)",
    trustText: "Secure SSL encryption. Your data is protected.",
    courierName: "InPost / DPD Courier (Fast door-to-door)",
    lockerName: "InPost Parcel Locker 24/7 (Pick up anytime)",
    orlenName: "ORLEN Parcel (Pick up at point / kiosk)",
    deliveryTimeCourier: "Delivery in 1-2 business days",
    deliveryTimeLocker: "Delivery tomorrow morning!",
    deliveryTimeOrlen: "Pickup in 2 business days",
    mostPopularBadge: "Most popular",
    searchLockerPrompt: "Type a location above to find a point",
    selectButton: "Select",
    changeLockerButton: "Change point",
    redirecting: "Connecting to secure payment gateway...",
    redirectingSubtitle: "You are being redirected to secure BLIK / Card / Google Pay payment. (Przelewy24 coming soon!)",
    autofillNotification: "We found your saved delivery details from your last visit! ✨",
    autofillButton: "Auto-fill details",
    autofillSuccess: "Details auto-filled successfully! 🚀",
    clearFields: "Clear fields",
    selectLockerError: "Please select a Parcel Locker from the list",
    selectOrlenError: "Please select an ORLEN pickup point",
  }
};

// --- REAL-WORLD POLISH INPOST LOCKERS PRE-POPULATED ---
const mockInPostLockers = [
  { id: "WAW102M", address: "Al. Jerozolimskie 54, Warszawa", desc: "Obok wejścia do Dworca Centralnego PKP" },
  { id: "WAW220A", address: "ul. Nowy Świat 22, Warszawa", desc: "Przy sklepie Carrefour Express" },
  { id: "KRA039N", address: "ul. Floriańska 12, Kraków", desc: "Przy wejściu głównym do Galerii" },
  { id: "GDA14B", address: "ul. Długa 45, Gdańsk", desc: "Obok Urzędu Pocztowego" },
  { id: "WRO77F", address: "ul. Świdnicka 18, Wrocław", desc: "Przy DH Renoma" },
  { id: "POZ55K", address: "ul. Półwiejska 32, Poznań", desc: "Przy wejściu do Starego Browaru" },
];

// --- ORLEN PACZKA PICK-UP POINTS ---
const mockOrlenPoints = [
  { id: "ORL1022", address: "ul. Grzybowska 4, Warszawa", desc: "Stacja Paliw ORLEN nr 4022" },
  { id: "ORL4591", address: "ul. Mogilska 35, Kraków", desc: "Stacja Paliw ORLEN nr 1591" },
  { id: "ORL8821", address: "ul. Podwale Staromiejskie 2, Gdańsk", desc: "Kiosk Ruchu przy przystanku" },
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  shippingMethod: "paczkomat" | "courier" | "orlen";
  paczkomatId: string;
  orlenPointId: string;
  street: string;
  zipCode: string;
  city: string;
  wantsInvoice: boolean;
  companyName: string;
  nip: string;
}

export function ShippingStep() {
  const locale = useLocale() as "pl" | "en";
  const t = translations[locale];
  const { currency } = useCurrency();
  const { items, isMounted } = useCart();
  const router = useRouter();

  const isPLN = currency === "PLN";
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  // --- INITIAL COMPONENT STATE ---
  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    shippingMethod: "paczkomat", // Pre-selected by Default (Default Bias)
    paczkomatId: "",
    orlenPointId: "",
    street: "",
    zipCode: "",
    city: "",
    wantsInvoice: false,
    companyName: "",
    nip: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(13 * 60 + 13); // Matched exact countdown state from reference
  const [lockerSearch, setLockerSearch] = useState("");
  const [isLockerSelectorOpen, setIsLockerSelectorOpen] = useState(false);
  const [dispatchCountdown, setDispatchCountdown] = useState(2 * 3600 + 44 * 60 + 15); // Dispatched countdown
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AUTO-FILL & PERSISTENCE STATES ---
  const [isCityHighlighted, setIsCityHighlighted] = useState(false);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);
  const [savedDetails, setSavedDetails] = useState<Partial<FormState> | null>(null);
  const [showAutofillBanner, setShowAutofillBanner] = useState(false);
  const [autofillSuccessMessage, setAutofillSuccessMessage] = useState(false);

  // --- CHECK SESSION AND LOCALSTORAGE FOR AUTO-FILL ---
  useEffect(() => {
    async function initAutofill() {
      let emailFromAuth = "";
      let nameFromAuth = "";

      // 1. Try to get logged-in user details
      try {
        const result = await getCurrentUserAction();
        if (result.success && result.user) {
          nameFromAuth = result.user.fullName || "";
          emailFromAuth = result.user.email || "";
          
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || nameFromAuth,
            email: prev.email || emailFromAuth,
          }));
        }
      } catch (err) {
        console.error("Failed to load user session for autofill:", err);
      }

      // 2. Check localStorage for saved delivery details from previous purchases
      try {
        const saved = localStorage.getItem("checkout_shipping_address");
        if (saved && saved.trim()) {
          const parsed = JSON.parse(saved) as Partial<FormState>;
          
          // Check if the saved data actually contains any useful shipping details
          const hasDetails = !!(
            parsed.fullName ||
            parsed.email ||
            parsed.phone ||
            parsed.street ||
            parsed.city
          );

          if (hasDetails) {
            setSavedDetails(parsed);
            setHasSavedDetails(true);
            setShowAutofillBanner(true);
          }
        }
      } catch (err) {
        console.error("Failed to load saved address from localStorage:", err);
      }
    }

    initAutofill();
  }, []);

  // --- DYNAMICALLY LOAD INPOST AND ORLEN MAP WIDGETS ---
  const [orlenScriptLoaded, setOrlenScriptLoaded] = useState(false);
  const [inpostScriptLoaded, setInpostScriptLoaded] = useState(false);
  const [useMapWidget, setUseMapWidget] = useState(false);

  useEffect(() => {
    // 1. Load InPost Geowidget CSS
    if (!document.getElementById("inpost-geowidget-css")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://geowidget.inpost.pl/inpost-geowidget.css";
      link.id = "inpost-geowidget-css";
      document.head.appendChild(link);
    }

    // 2. Load InPost Geowidget JS
    if (!document.getElementById("inpost-geowidget-js")) {
      const script = document.createElement("script");
      script.src = "https://geowidget.inpost.pl/inpost-geowidget.js";
      script.id = "inpost-geowidget-js";
      script.defer = true;
      script.onload = () => setInpostScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setTimeout(() => setInpostScriptLoaded(true), 0);
    }

    // 3. Load ORLEN Paczka CSS
    if (!document.getElementById("orlen-widget-css")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://ruch-osm.sysadvisors.pl/widget.css";
      link.id = "orlen-widget-css";
      document.head.appendChild(link);
    }

    // 4. Load ORLEN Paczka JS
    if (!document.getElementById("orlen-widget-js")) {
      const script = document.createElement("script");
      script.src = "https://ruch-osm.sysadvisors.pl/widget.js?i=12";
      script.id = "orlen-widget-js";
      script.defer = true;
      script.onload = () => setOrlenScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setTimeout(() => setOrlenScriptLoaded(true), 0);
    }

    // 5. InPost Geowidget event listener
    const handleInPostPoint = (e: any) => {
      const point = e.detail || e.details;
      if (point && point.name) {
        setFormData((prev) => ({ ...prev, paczkomatId: point.name }));
        setErrors((prev) => ({ ...prev, paczkomatId: "" }));
        setIsLockerSelectorOpen(false);
      }
    };

    document.addEventListener("onpointselect", handleInPostPoint);

    return () => {
      document.removeEventListener("onpointselect", handleInPostPoint);
    };
  }, []);

  // --- INITIALIZE ORLEN PACZKA WIDGET WHEN CONTAINER IS READY ---
  useEffect(() => {
    if (
      formData.shippingMethod === "orlen" &&
      (!formData.orlenPointId || isLockerSelectorOpen) &&
      orlenScriptLoaded &&
      typeof window !== "undefined" &&
      (window as any).RuchWidget
    ) {
      const timer = setTimeout(() => {
        const container = document.getElementById("orlen-widget-container");
        if (container) {
          try {
            const widget = new (window as any).RuchWidget("orlen-widget-container", {
              selectCb: (point: any) => {
                const pointId = point.destinationCode || point.code || point.id;
                if (pointId) {
                  setFormData((prev) => ({ ...prev, orlenPointId: pointId }));
                  setErrors((prev) => ({ ...prev, orlenPointId: "" }));
                  setIsLockerSelectorOpen(false);
                }
              },
              sandbox: 0,
              initialAddress: formData.city || "Warszawa",
            });
            widget.init();
          } catch (err) {
            console.error("Failed to initialize RuchWidget:", err);
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [formData.shippingMethod, formData.orlenPointId, isLockerSelectorOpen, orlenScriptLoaded, formData.city]);

  const handleApplyAutofill = () => {
    if (!savedDetails) return;
    
    setFormData((prev) => ({
      ...prev,
      ...savedDetails,
      // Keep current shipping method selection unless user wants to override
      shippingMethod: savedDetails.shippingMethod || prev.shippingMethod,
    }));

    // Clear errors for auto-filled fields
    setErrors({});
    
    // Show success toast/badge
    setAutofillSuccessMessage(true);
    setShowAutofillBanner(false);
    setTimeout(() => setAutofillSuccessMessage(false), 4000);
  };

  const handleClearAutofill = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      shippingMethod: "paczkomat",
      paczkomatId: "",
      orlenPointId: "",
      street: "",
      zipCode: "",
      city: "",
      wantsInvoice: false,
      companyName: "",
      nip: "",
    });
    setTouched({});
    setErrors({});
    setHasSavedDetails(false);
    setSavedDetails(null);
    setShowAutofillBanner(false);
    try {
      localStorage.removeItem("checkout_shipping_address");
    } catch (err) {
      console.error(err);
    }
  };

  // --- B2B GUS LOOKUP SIMULATION ---
  const [isLoadingGus, setIsLoadingGus] = useState(false);

  const handleGusLookup = () => {
    if (formData.nip.length !== 10) return;
    setIsLoadingGus(true);
    
    setTimeout(() => {
      setIsLoadingGus(false);
      // High-fidelity Polish B2B mock data based on the NIP
      const mockCompanies: Record<string, { name: string; street: string; zip: string; city: string }> = {
        "7792439345": { name: "Żabka Polska Sp. z o.o.", street: "pl. Andersa 12", zip: "61-894", city: "Poznań" },
        "5260211090": { name: "Allegro sp. z o.o.", street: "Wierzbięcice 1B", zip: "61-569", city: "Poznań" },
        "5261040828": { name: "InPost Sp. z o.o.", street: "ul. Wielicka 28", zip: "30-552", city: "Kraków" },
      };

      const found = mockCompanies[formData.nip] || {
        name: `Firma Handlowo-Usługowa NIP-${formData.nip} Sp. z o.o.`,
        street: "Al. Jerozolimskie 45/12",
        zip: "00-010",
        city: "Warszawa",
      };

      setFormData((prev) => ({
        ...prev,
        companyName: found.name,
        street: prev.street || found.street,
        zipCode: prev.zipCode || found.zip,
        city: prev.city || found.city,
        shippingMethod: "courier", // Switch to courier since they filled a physical address
      }));

      // Clear errors for auto-filled fields
      setErrors((prev) => ({
        ...prev,
        companyName: "",
        street: "",
        zipCode: "",
        city: "",
      }));

      // Trigger highlight
      setIsCityHighlighted(true);
      setTimeout(() => setIsCityHighlighted(false), 2000);
    }, 1000);
  };

  // --- RESERVATION TIMER COUNTER ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // --- DISPATCH COUNTDOWN TIMER ---
  useEffect(() => {
    if (dispatchCountdown <= 0) return;
    const interval = setInterval(() => {
      setDispatchCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatchCountdown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDispatchTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  // --- POLISH NIP CHECKSUM LOGIC ---
  const validatePolishNIP = (nipStr: string): boolean => {
    const nip = nipStr.replace(/\D/g, "");
    if (nip.length !== 10) return false;
    
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nip[i], 10) * weights[i];
    }
    
    const control = sum % 11;
    return control === parseInt(nip[9], 10);
  };

  // --- INTERACTIVE MASKS & DYNAMIC DELIGHT TRIGGERS ---
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (locale === "pl") {
      val = val.replace(/\D/g, "");
      if (val.length > 2) {
        val = `${val.slice(0, 2)}-${val.slice(2, 5)}`;
      }
    }
    setFormData((prev) => ({ ...prev, zipCode: val }));

    // Magic-fill delight based on major Polish ZIP code postal mappings
    if (locale === "pl" && val === "00-501") {
      setFormData((prev) => ({ ...prev, city: "Warszawa" }));
      setErrors((prev) => ({ ...prev, city: "" }));
      setIsCityHighlighted(true);
      setTimeout(() => setIsCityHighlighted(false), 2000);
    } else if (locale === "pl" && val === "31-150") {
      setFormData((prev) => ({ ...prev, city: "Kraków" }));
      setErrors((prev) => ({ ...prev, city: "" }));
      setIsCityHighlighted(true);
      setTimeout(() => setIsCityHighlighted(false), 2000);
    } else if (locale === "pl" && val === "80-100") {
      setFormData((prev) => ({ ...prev, city: "Gdańsk" }));
      setErrors((prev) => ({ ...prev, city: "" }));
      setIsCityHighlighted(true);
      setTimeout(() => setIsCityHighlighted(false), 2000);
    } else if (locale === "pl" && val.length === 6) {
      const cleanZip = val.replace("-", "");
      fetch(`https://api.zippopotam.us/pl/${cleanZip}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Not found");
        })
        .then((data) => {
          if (data && data.places && data.places[0]) {
            const cityName = data.places[0]["place name"];
            setFormData((prev) => ({ ...prev, city: cityName }));
            setErrors((prev) => ({ ...prev, city: "" }));
            setIsCityHighlighted(true);
            setTimeout(() => setIsCityHighlighted(false), 2000);
          }
        })
        .catch((err) => {
          console.log("ZIP code lookup failed or not found:", err);
        });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const startsWithPlus = val.startsWith("+");
    val = val.replace(/\D/g, "");
    
    if (startsWithPlus) {
      val = "+" + val;
    } else if (val.length > 0 && !val.startsWith("48")) {
      // Comfort prefixing for standard Polish layouts
      val = "48" + val;
    }

    // Nicely format phone number visually for display
    let formatted = val;
    if (val.startsWith("48") && val.length > 2) {
      const rest = val.slice(2);
      const groups = rest.match(/.{1,3}/g) || [];
      formatted = "+48 " + groups.join(" ");
    } else if (val.startsWith("+48") && val.length > 3) {
      const rest = val.slice(3).replace(/\s/g, "");
      const groups = rest.match(/.{1,3}/g) || [];
      formatted = "+48 " + groups.join(" ");
    }

    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleNIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, nip: val }));
  };

  // --- VALIDATION AND STATE MANAGEMENT ---
  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error = "";
    const value = String(formData[field] || "").trim();

    if (!value && field !== "paczkomatId" && field !== "orlenPointId" && field !== "street" && field !== "companyName" && field !== "nip") {
      error = t.fieldRequired;
    } else if (field === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = t.fieldInvalid;
    } else if (field === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 9) {
        error = t.fieldInvalid;
      }
    } else if (field === "nip" && formData.wantsInvoice) {
      if (!validatePolishNIP(value)) {
        error = t.nipInvalid;
      }
    } else if (field === "companyName" && formData.wantsInvoice && !value) {
      error = t.fieldRequired;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // --- FILTERED LOCKERS / POINTS ---
  const filteredLockers = useMemo(() => {
    if (!lockerSearch) return mockInPostLockers;
    return mockInPostLockers.filter(
      (l) =>
        l.id.toLowerCase().includes(lockerSearch.toLowerCase()) ||
        l.address.toLowerCase().includes(lockerSearch.toLowerCase())
    );
  }, [lockerSearch]);

  const filteredOrlenPoints = useMemo(() => {
    if (!lockerSearch) return mockOrlenPoints;
    return mockOrlenPoints.filter(
      (p) =>
        p.id.toLowerCase().includes(lockerSearch.toLowerCase()) ||
        p.address.toLowerCase().includes(lockerSearch.toLowerCase())
    );
  }, [lockerSearch]);

  // --- PRICING RULES ---
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = isPLN ? item.product.pricePLN : item.product.priceEUR;
      return acc + price * item.quantity;
    }, 0);
  }, [items, isPLN]);

  const freeShippingThreshold = isPLN ? 199 : 45;
  const isFreeShipping = subtotal >= freeShippingThreshold;

  const standardShippingCost = useMemo(() => {
    switch (formData.shippingMethod) {
      case "paczkomat":
        return isPLN ? 12.99 : 3.49;
      case "courier":
        return isPLN ? 16.99 : 4.49;
      case "orlen":
        return isPLN ? 9.99 : 2.99;
      default:
        return 0;
    }
  }, [formData.shippingMethod, isPLN]);

  const shippingCost = isFreeShipping ? 0 : standardShippingCost;
  const total = subtotal + shippingCost;

  const formatLocalPrice = (amount: number) => {
    return formatPrice(amount, currency, intlLocale);
  };

  // --- VERIFY IF ENTIRE STEP FORM STATE IS PERFECTLY VALID ---
  const isFormValid = () => {
    const commonValid = 
      formData.fullName.trim() !== "" &&
      !errors.fullName &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      !errors.email &&
      formData.phone.replace(/\D/g, "").length >= 9 &&
      !errors.phone;

    if (!commonValid) return false;

    if (formData.shippingMethod === "paczkomat") {
      if (!formData.paczkomatId) return false;
    } else if (formData.shippingMethod === "orlen") {
      if (!formData.orlenPointId) return false;
    } else if (formData.shippingMethod === "courier") {
      if (!formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim() || errors.street || errors.zipCode || errors.city) {
        return false;
      }
    }

    if (formData.wantsInvoice) {
      if (!formData.companyName.trim() || !validatePolishNIP(formData.nip) || errors.companyName || errors.nip) {
        return false;
      }
    }

    return true;
  };

  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {
      fullName: true,
      email: true,
      phone: true,
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.fieldRequired;
    }
    if (!formData.email.trim()) {
      newErrors.email = t.fieldRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.fieldInvalid;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t.fieldRequired;
    } else if (formData.phone.replace(/\D/g, "").length < 9) {
      newErrors.phone = t.fieldInvalid;
    }

    if (formData.shippingMethod === "paczkomat") {
      newTouched.paczkomatId = true;
      if (!formData.paczkomatId) {
        newErrors.paczkomatId = t.selectLockerError;
      }
    } else if (formData.shippingMethod === "orlen") {
      newTouched.orlenPointId = true;
      if (!formData.orlenPointId) {
        newErrors.orlenPointId = t.selectOrlenError;
      }
    } else if (formData.shippingMethod === "courier") {
      newTouched.street = true;
      newTouched.zipCode = true;
      newTouched.city = true;
      if (!formData.street.trim()) newErrors.street = t.fieldRequired;
      if (!formData.zipCode.trim()) newErrors.zipCode = t.fieldRequired;
      if (!formData.city.trim()) newErrors.city = t.fieldRequired;
    }

    if (formData.wantsInvoice) {
      newTouched.companyName = true;
      newTouched.nip = true;
      if (!formData.companyName.trim()) newErrors.companyName = t.fieldRequired;
      if (!validatePolishNIP(formData.nip)) newErrors.nip = t.nipInvalid;
    }

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAllFields();
    if (isValid) {
      setIsSubmitting(true);
      
      // Save shipping details to localStorage for future auto-fill
      try {
        localStorage.setItem("checkout_shipping_address", JSON.stringify(formData));
      } catch (err) {
        console.error("Failed to save shipping details to localStorage:", err);
      }

      // Simulate highly aesthetic transitions to secure gateway
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/payment");
      }, 1000);
    } else {
      // Auto-open locker selection dropdown if point is missing
      if (formData.shippingMethod === "paczkomat" && !formData.paczkomatId) {
        setIsLockerSelectorOpen(true);
      } else if (formData.shippingMethod === "orlen" && !formData.orlenPointId) {
        setIsLockerSelectorOpen(true);
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* FULL-SCREEN SECURE PAYMENT TRANSITION PORTAL */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md space-y-6"
            >
              <div className="relative flex justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">{t.redirecting}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                  {t.redirectingSubtitle}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="h-4 w-4 bg-[#FFCC00] rounded-xs flex items-center justify-center text-black font-black text-[8px]">in</div>
                  <span className="text-[10px] font-black text-white tracking-tighter">InPost</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-80">
                  <span className="text-xs font-black tracking-tighter text-rose-600">BLIK</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-40 relative group/p24">
                  <span className="text-xs font-black tracking-tighter text-blue-500">P24</span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-[8px] text-slate-300 px-1.5 py-0.5 rounded font-bold whitespace-nowrap opacity-0 group-hover/p24:opacity-100 transition-opacity">
                    {locale === "pl" ? "Wkrótce" : "Soon"}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. GOAL-GRADIENT STEPPER PROGRESS HEADER */}
      <nav className="mb-8" aria-label="Checkout Progress">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            style={{ width: "50%" }} // Stepper shows step 2 is active
          />

          {t.stepper.map((step, index) => {
            const isActive = index === 1;
            const isCompleted = index < 1;
            return (
              <div key={step} className="flex flex-col items-center z-10 relative">
                <div 
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-white ring-4 ring-primary/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                      : isCompleted 
                        ? "bg-primary text-white" 
                        : "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : index + 1}
                </div>
                <span 
                  className={`mt-2 text-[11px] sm:text-xs font-extrabold tracking-tight ${
                    isActive 
                      ? "text-primary font-black" 
                      : isCompleted 
                        ? "text-slate-700 dark:text-slate-300 font-extrabold" 
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* 2. ETHICAL URGENCY BANNER */}
      {timeLeft > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 px-4 py-3 text-xs font-bold text-amber-800 dark:text-amber-400 shadow-xs"
        >
          <Clock className="h-4 w-4 animate-pulse shrink-0" />
          <p className="leading-tight text-center sm:text-left">
            {t.urgency}{" "}
            <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">
              {formatTimer(timeLeft)}
            </span>{" "}
            {t.minutes}.
          </p>
        </motion.div>
      )}

      {/* 3. DYNAMIC DISPATCH COUNTDOWN (Positive UX Hook) */}
      {dispatchCountdown > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-xs"
        >
          <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
          <p className="leading-tight text-center sm:text-left">
            {t.deliveryTomorrow.replace("{time}", formatDispatchTimer(dispatchCountdown))}
          </p>
        </motion.div>
      )}

      {/* 4. MAGIC AUTO-FILL BANNER (Delightful returning user UX) */}
      <AnimatePresence>
        {showAutofillBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/30 p-4 text-xs font-bold text-indigo-800 dark:text-indigo-400 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                    {t.autofillNotification}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                    {savedDetails?.fullName} ({savedDetails?.email})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyAutofill}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {t.autofillButton}
                </button>
                <button
                  type="button"
                  onClick={handleClearAutofill}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-[10px] font-extrabold cursor-pointer"
                >
                  {t.clearFields}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. AUTO-FILL SUCCESS TOAST */}
      <AnimatePresence>
        {autofillSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-xs">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 stroke-[3px]" />
              <p className="leading-tight">
                {t.autofillSuccess}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE LAYOUT GRID */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT HAND SECTION: FORM FIELDS (8/12) --- */}
        <section className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-8 shadow-xs space-y-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-4">
              {t.title}
            </h2>

            {/* PART 1: CONTACT DETAILS */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <User className="h-4.5 w-4.5" />
                {t.contactTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1 relative">
                  <span className="absolute left-4 top-5.5 text-slate-400 pointer-events-none">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={t.fullname}
                    className={`w-full rounded-2xl border px-11 py-4 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                      touched.fullName && !errors.fullName
                        ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5"
                        : touched.fullName && errors.fullName
                        ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                        : "border-slate-200 dark:border-slate-800 focus:border-primary"
                    }`}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    onBlur={() => handleBlur("fullName")}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 px-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email input */}
                <div className="space-y-1 relative">
                  <span className="absolute left-4 top-5.5 text-slate-400 pointer-events-none">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t.email}
                    className={`w-full rounded-2xl border px-11 py-4 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                      touched.email && !errors.email
                        ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5"
                        : touched.email && errors.email
                        ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                        : "border-slate-200 dark:border-slate-800 focus:border-primary"
                    }`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur("email")}
                  />
                  {touched.email && errors.email && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 px-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone number input with Polish form prefix visually formatted */}
                <div className="space-y-1 relative sm:col-span-2">
                  <span className="absolute left-4 top-5.5 text-slate-400 pointer-events-none">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder={t.phonePlaceholder}
                    className={`w-full rounded-2xl border px-11 py-4 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                      touched.phone && !errors.phone
                        ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5"
                        : touched.phone && errors.phone
                        ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                        : "border-slate-200 dark:border-slate-800 focus:border-primary"
                    }`}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("phone")}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 px-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PART 2: SHIPPING METHODS */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Truck className="h-4.5 w-4.5" />
                {t.deliveryMethodTitle}
              </h3>

              <div className="space-y-3">
                {/* CHOICE A: Paczkomaty InPost (Preselected) */}
                <div 
                  onClick={() => setFormData({ ...formData, shippingMethod: "paczkomat" })}
                  className={`group flex items-start justify-between p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    formData.shippingMethod === "paczkomat"
                      ? "border-primary bg-primary/3 shadow-xs ring-2 ring-primary/25"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 mt-1 shrink-0">
                      {formData.shippingMethod === "paczkomat" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          <div className="h-4 w-4 bg-[#FFCC00] rounded-xs flex items-center justify-center text-black font-black text-[10px]">in</div>
                          <span className="text-sm font-black text-black dark:text-white tracking-tighter">{t.lockerName}</span>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-500 animate-pulse">
                          {t.mostPopularBadge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.deliveryTimeLocker}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary shrink-0 pl-2">
                    {isFreeShipping ? "FREE" : formatLocalPrice(isPLN ? 12.99 : 3.49)}
                  </span>
                </div>

                {/* CHOICE B: Courier Home Delivery */}
                <div 
                  onClick={() => setFormData({ ...formData, shippingMethod: "courier" })}
                  className={`group flex items-start justify-between p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    formData.shippingMethod === "courier"
                      ? "border-primary bg-primary/3 shadow-xs ring-2 ring-primary/25"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 mt-1 shrink-0">
                      {formData.shippingMethod === "courier" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">{t.courierName}</span>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.deliveryTimeCourier}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary shrink-0 pl-2">
                    {isFreeShipping ? "FREE" : formatLocalPrice(isPLN ? 16.99 : 4.49)}
                  </span>
                </div>

                {/* CHOICE C: Orlen Paczka Point Pickup */}
                <div 
                  onClick={() => setFormData({ ...formData, shippingMethod: "orlen" })}
                  className={`group flex items-start justify-between p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    formData.shippingMethod === "orlen"
                      ? "border-primary bg-primary/3 shadow-xs ring-2 ring-primary/25"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 mt-1 shrink-0">
                      {formData.shippingMethod === "orlen" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-red-600">ORLEN</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.orlenName}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.deliveryTimeOrlen}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary shrink-0 pl-2">
                    {isFreeShipping ? "FREE" : formatLocalPrice(isPLN ? 9.99 : 2.99)}
                  </span>
                </div>
              </div>
            </div>

            {/* PART 3: PROGRESSIVE DISCLOSURE FOR CONDITIONAL DELIVERY FORMS */}
            <AnimatePresence mode="wait">
              {formData.shippingMethod === "paczkomat" && (
                <motion.div
                  key="paczkomat-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5" />
                    Wyszukaj najbliższy Paczkomat
                  </h3>

                  {formData.paczkomatId && !isLockerSelectorOpen ? (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/3 flex items-start gap-4"
                    >
                      <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      </div>
                      <div className="text-xs flex-1">
                        <p className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm leading-none">{t.selectedLocker}: {formData.paczkomatId}</p>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 leading-relaxed">
                          {mockInPostLockers.find(l => l.id === formData.paczkomatId)?.address || "Paczkomat InPost"}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsLockerSelectorOpen(true)}
                        className="text-xs font-black text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        {t.changeLockerButton}
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <Search className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="text"
                          placeholder={t.paczkomatPlaceholder}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 text-sm font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:border-primary transition-all text-slate-900 dark:text-slate-100"
                          value={lockerSearch}
                          onChange={(e) => setLockerSearch(e.target.value)}
                        />
                      </div>

                      {/* Native List of Lockers */}
                      {!useMapWidget && (
                        <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {filteredLockers.length > 0 ? (
                            filteredLockers.map((locker) => (
                              <div
                                key={locker.id}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, paczkomatId: locker.id }));
                                  setErrors((prev) => ({ ...prev, paczkomatId: "" }));
                                  setIsLockerSelectorOpen(false);
                                }}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer transition-colors flex items-start justify-between gap-4 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                      {locker.id}
                                    </span>
                                    <span className="font-bold text-slate-500 dark:text-slate-400">
                                      {locker.desc}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300">{locker.address}</p>
                                </div>
                                <button
                                  type="button"
                                  className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-xl font-black transition-colors shrink-0"
                                >
                                  {t.selectButton}
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-400 font-bold">
                              {locale === "pl" ? "Nie znaleziono Paczkomatów dla wpisanej frazy" : "No Parcel Lockers found for the entered phrase"}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Map Toggle Button */}
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setUseMapWidget(!useMapWidget)}
                          className="text-xs font-black text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <MapPin className="h-4 w-4" />
                          {useMapWidget 
                            ? (locale === "pl" ? "Wybierz z listy (Szybsze)" : "Choose from list (Faster)") 
                            : (locale === "pl" ? "Otwórz mapę Paczkomatów" : "Open Parcel Lockers map")}
                        </button>
                      </div>

                      {/* Map Widget (Conditional on Toggle & Script Loaded) */}
                      {useMapWidget && (
                        <div className="w-full h-100 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                          {inpostScriptLoaded ? (
                            <inpost-geowidget 
                              token="sdk-sandbox-token" 
                              language={locale} 
                              config="parcelCollect"
                              onpoint="onpointselect"
                              class="w-full h-full border-0"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                              <p className="text-xs text-slate-500 font-bold">
                                {locale === "pl" ? "Ładowanie mapy Paczkomatów..." : "Loading Parcel Lockers map..."}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {touched.paczkomatId && errors.paczkomatId && (
                        <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.paczkomatId}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {formData.shippingMethod === "orlen" && (
                <motion.div
                  key="orlen-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5" />
                    Wybierz Punkt ORLEN Paczka
                  </h3>

                  {formData.orlenPointId && !isLockerSelectorOpen ? (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/3 flex items-start gap-4"
                    >
                      <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      </div>
                      <div className="text-xs flex-1">
                        <p className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm leading-none">Wybrany punkt: {formData.orlenPointId}</p>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 leading-relaxed">
                          {mockOrlenPoints.find(p => p.id === formData.orlenPointId)?.address || "Punkt ORLEN Paczka"}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsLockerSelectorOpen(true)}
                        className="text-xs font-black text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        {t.changeLockerButton}
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <Search className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="text"
                          placeholder={locale === "pl" ? "Wpisz kod punktu lub miasto/ulicę (np. ORL...)" : "Enter point code or city/street (e.g. ORL...)"}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 text-sm font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:border-primary transition-all text-slate-900 dark:text-slate-100"
                          value={lockerSearch}
                          onChange={(e) => setLockerSearch(e.target.value)}
                        />
                      </div>

                      {/* Native List of Points */}
                      {!useMapWidget && (
                        <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {filteredOrlenPoints.length > 0 ? (
                            filteredOrlenPoints.map((point) => (
                              <div
                                key={point.id}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, orlenPointId: point.id }));
                                  setErrors((prev) => ({ ...prev, orlenPointId: "" }));
                                  setIsLockerSelectorOpen(false);
                                }}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer transition-colors flex items-start justify-between gap-4 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
                                      {point.id}
                                    </span>
                                    <span className="font-bold text-slate-500 dark:text-slate-400">
                                      {point.desc}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300">{point.address}</p>
                                </div>
                                <button
                                  type="button"
                                  className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-xl font-black transition-colors shrink-0"
                                >
                                  {t.selectButton}
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-400 font-bold">
                              {locale === "pl" ? "Nie znaleziono punktów ORLEN Paczka dla wpisanej frazy" : "No ORLEN Parcel points found for the entered phrase"}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Map Toggle Button */}
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setUseMapWidget(!useMapWidget)}
                          className="text-xs font-black text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <MapPin className="h-4 w-4" />
                          {useMapWidget 
                            ? (locale === "pl" ? "Wybierz z listy (Szybsze)" : "Choose from list (Faster)") 
                            : (locale === "pl" ? "Otwórz mapę punktów" : "Open pickup points map")}
                        </button>
                      </div>

                      {/* Map Widget Container */}
                      {useMapWidget && (
                        <div className="w-full h-100 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                          {orlenScriptLoaded ? (
                            <div 
                              id="orlen-widget-container" 
                              className="w-full h-full border-0"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                              <p className="text-xs text-slate-500 font-bold">
                                {locale === "pl" ? "Ładowanie mapy ORLEN Paczka..." : "Loading ORLEN Parcel map..."}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {touched.orlenPointId && errors.orlenPointId && (
                        <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.orlenPointId}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {formData.shippingMethod === "courier" && (
                <motion.div
                  key="courier-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5" />
                    {t.addressTitle}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Street details */}
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-bold text-slate-500">{t.street}</label>
                      <input
                        type="text"
                        required
                        autoComplete="address-line1"
                        placeholder={t.streetPlaceholder}
                        className={`w-full rounded-2xl border px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary ${
                          touched.street && !errors.street
                            ? "border-emerald-500"
                            : touched.street && errors.street
                            ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                            : ""
                        }`}
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        onBlur={() => handleBlur("street")}
                      />
                      {touched.street && errors.street && (
                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.street}
                        </p>
                      )}
                    </div>

                    {/* Postal code */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">{t.zip}</label>
                      <input
                        type="text"
                        required
                        autoComplete="postal-code"
                        placeholder={t.zipPlaceholder}
                        maxLength={6}
                        className={`w-full rounded-2xl border px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary ${
                          touched.zipCode && !errors.zipCode
                            ? "border-emerald-500"
                            : touched.zipCode && errors.zipCode
                            ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                            : ""
                        }`}
                        value={formData.zipCode}
                        onChange={handleZipChange}
                        onBlur={() => handleBlur("zipCode")}
                      />
                      {touched.zipCode && errors.zipCode && (
                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.zipCode}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500">{t.city}</label>
                      <input
                        type="text"
                        required
                        autoComplete="address-level2"
                        placeholder={t.cityPlaceholder}
                        className={`w-full rounded-2xl border px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary ${
                          isCityHighlighted
                            ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10 scale-[1.01]"
                            : touched.city && !errors.city
                            ? "border-emerald-500"
                            : touched.city && errors.city
                            ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                            : ""
                        }`}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={() => handleBlur("city")}
                      />
                      {touched.city && errors.city && (
                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PART 4: VAT INVOICE ACCORDION BOX */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.wantsInvoice}
                  onChange={(e) => setFormData({ ...formData, wantsInvoice: e.target.checked })}
                />
                <div 
                  className={`h-6.5 w-6.5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    formData.wantsInvoice 
                      ? "bg-primary border-primary shadow-xs" 
                      : "border-slate-200 dark:border-slate-800 group-hover:border-primary"
                  }`}
                >
                  {formData.wantsInvoice && <Check className="h-4.5 w-4.5 text-white stroke-[3px]" />}
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-slate-400" />
                  {t.invoiceCheckbox}
                </span>
              </label>

              <AnimatePresence>
                {formData.wantsInvoice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden pt-2"
                  >
                    {/* Invoice: Company Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500">{t.companyName}</label>
                      <input
                        type="text"
                        required
                        autoComplete="organization"
                        placeholder={t.companyNamePlaceholder}
                        className={`w-full rounded-2xl border px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                          touched.companyName && !errors.companyName
                            ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5"
                            : touched.companyName && errors.companyName
                            ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                            : "border-slate-200 dark:border-slate-800 focus:border-primary"
                        }`}
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        onBlur={() => handleBlur("companyName")}
                      />
                    </div>

                    {/* Invoice: NIP */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">{t.nip}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder={t.nipPlaceholder}
                          maxLength={10}
                          className={`w-full rounded-2xl border pl-4 pr-20 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                            touched.nip && !errors.nip
                              ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5"
                              : touched.nip && errors.nip
                              ? "border-rose-500 bg-rose-50/10 dark:bg-rose-950/10"
                              : "border-slate-200 dark:border-slate-800 focus:border-primary"
                          }`}
                          value={formData.nip}
                          onChange={handleNIPChange}
                          onBlur={() => handleBlur("nip")}
                        />
                        {formData.nip.length === 10 && (
                          <button
                            type="button"
                            onClick={handleGusLookup}
                            disabled={isLoadingGus}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-tight transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isLoadingGus ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <>
                                <Building className="h-3 w-3" />
                                <span>GUS</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {touched.nip && errors.nip && (
                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 px-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.nip}
                        </p>
                      )}
                    </div>
                    <p className="sm:col-span-3 text-[10px] text-slate-400 font-semibold">{t.vatInvoiceIncluded}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* BACK TO CART TRANSITION */}
          <div className="flex justify-start">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors py-3"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToCart}
            </Link>
          </div>
        </section>

        {/* --- RIGHT HAND COLUMN: ORDER KEEPSAKE SUMMARY (4/12) --- */}
        <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6 shadow-xs space-y-6">
            <h3 className="text-lg font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              {t.summary}
            </h3>

            {/* KEEP-SAKE VALUE HOOK: Circular image grid of current ordered items */}
            <div className="flex flex-wrap gap-2.5 py-1">
              {items.map((item) => (
                <div key={item.id} className="relative group shrink-0">
                  <div className="h-12.5 w-12.5 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-primary transition-all">
                    <img 
                      src={item.product.image} 
                      alt={item.product.title} 
                      className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-300" 
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-xs">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price detail blocks */}
            <div className="space-y-3 text-sm font-semibold border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.subtotal}</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-100">{formatLocalPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.shipping}</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-100">
                  {shippingCost === 0 ? (
                    <span className="text-primary font-black uppercase tracking-wider text-xs">FREE</span>
                  ) : (
                    formatLocalPrice(shippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <span>{t.total}</span>
                <span className="text-xl sm:text-2xl tracking-tight tabular-nums text-primary">
                  {formatLocalPrice(total)}
                </span>
              </div>
            </div>

            {/* Legal VAT claim */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              {t.vatIncluded}
            </p>

            {/* SHIMMER EFFECT MEGAGRADIENT PRIMARY SUBMIT CTA */}
            <div className="relative group">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-full bg-primary py-4 px-6 text-sm font-black text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {/* 100% self-contained looping Framer Motion shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "linear",
                  }}
                />
                
                <span>{t.proceedToPayment}</span>
                <ArrowRight className="h-4.5 w-4.5 stroke-[2.5px]" />
              </motion.button>
            </div>

            {/* Trust and safety badging */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center pt-1 leading-relaxed">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{t.trustText}</span>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}
