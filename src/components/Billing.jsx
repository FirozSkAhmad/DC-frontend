import "./Billing.css";
import Loader from "./Loader";
import sharedContext from "../context/SharedContext";
import { useState, useContext, useEffect } from "react";
import SideNav from "./SideNav";
import easyinvoice from "easyinvoice";
import { TextField, Autocomplete } from "@mui/material";
import toast from "react-hot-toast";
// import dressCodeLogo from "../../utils/Official_logo_of_the_All_India_Anna_Dravida_Munnetra_Kazhagam-removebg-preview 1.png";

const Billing = () => {
  const { userRole, isSideNavOpen, setLoader, token, emailId } =
    useContext(sharedContext);

  const executiveName = sessionStorage.getItem("executiveName");

  const [availableProductsNms, setAvailableProductsNms] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [studentDetails, setStudentDetails] = useState({
    studentName: "",
    class: "",
    rollNo: "",
    emailId: "",
    phnNo: "",
    mode_of_payment: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(
    studentDetails.mode_of_payment || ""
  );

  const [products, setProducts] = useState([
    {
      productId: "",
      productName: "",
      size: "",
      quantity: "",
      price: "",
      presentQuantity: "",
    },
  ]);

  const [totalPrice, setTotalPrice] = useState(0);

  // State to track whether the screen is below the medium breakpoint
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Tailwind's 'md' breakpoint is 768px by default

  useEffect(() => {
    function handleResize() {
      // Update the state based on window width
      setIsSmallScreen(window.innerWidth < 768);
    }

    // Set up the event listener
    window.addEventListener("resize", handleResize);

    // Call the handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productId: "",
        productName: "",
        size: "",
        quantity: "",
        price: "",
        presentQuantity: "",
      },
    ]);
    toast.success("Added new product row");
  };

  const handleProductChange = async (index, fieldName, value) => {
    const updatedProducts = [...products];
    if (fieldName === "quantity") {
      if (value > updatedProducts[index].presentQuantity) {
        alert(
          `Only ${updatedProducts[index].presentQuantity} items are available in stock for this product`
        );
      }
    }
    updatedProducts[index][fieldName] = value;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    if (fieldName === "productName") {
      // Fetch product name based on selected part number
      setLoader(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/admin/getProductSizes/${value}`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          updatedProducts[index].size = "";
          updatedProducts[index].productId = "";
          updatedProducts[index].quantity = "";
          updatedProducts[index].price = "";
          setAvailableSizes(obj.data);
          setLoader(false);
        } else {
          console.error("Failed to fetch Sizes");
          setLoader(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setLoader(false);
      }
    }

    if (fieldName === "size") {
      // Fetch product name based on selected part number
      try {
        setLoader(true);
        // Initial fetch to get Product ID based on name and size
        const response = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/admin/getProductIdByProductNameAndSize/${
            updatedProducts[index].productName
          }/${value}`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          updatedProducts[index].productId = "";
          updatedProducts[index].quantity = "";
          updatedProducts[index].price = "";
          updatedProducts[index].productId = obj.productId;
          // Use a different variable or reuse the same variable for a new request
          const result = await fetch(
            `${
              import.meta.env.VITE_BASE_URL
            }/admin/getPriceAndQuantityByProductId/${obj.productId}`,
            requestOptions
          );
          if (result.ok) {
            const data = await result.json();
            updatedProducts[index].price = data.MRP;
            updatedProducts[index].presentQuantity = data.quantity;
            setLoader(false);
          } else {
            setLoader(false);
            throw new Error("Failed to fetch product price");
          }
        } else {
          setLoader(false);
          throw new Error("Failed to fetch product ID");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    setProducts(updatedProducts);
    const newTotalPrice = updatedProducts.reduce(
      (sum, product) =>
        sum +
        parseFloat(product.price || 0) * parseFloat(product.quantity || 1),
      0
    );
    setTotalPrice(newTotalPrice);
  };

  const handleRemoveProduct = (indexToRemove) => {
    if (products.length <= 1) {
      toast.error("Cann't remove the last product row.");
      return;
    }

    setProducts(products.filter((_, index) => index !== indexToRemove));

    const newTotalPrice = products.reduce(
      (sum, product) => sum + parseFloat(product.price || 0),
      0
    );
    setTotalPrice(newTotalPrice);
    toast.success("Product row removed");
  };

  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        setLoader(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/admin/getAllProductNames`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          setAvailableProductsNms(obj.data);
          setLoader(false);
        } else {
          console.error("Failed to fetch part numbers");
          setLoader(false);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProductNames();
  }, []);

  const clearFields = () => {
    setProducts([
      {
        productId: "",
        productName: "",
        size: "",
        quantity: "",
        price: "",
        presentQuantity: "",
      },
    ]);
    setStudentDetails({
      studentName: "",
      class: "",
      rollNo: "",
      emailId: "",
      phnNo: "",
      mode_of_payment: "",
    });
    setSelectedPayment("");
    setTotalPrice(0);
  };

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    if (name === "mode_of_payment") {
      setSelectedPayment(value);
    }
    setStudentDetails({
      ...studentDetails,
      [name]: value,
    });
  };

  const submitBill = async (event) => {
    event.preventDefault();
    // Phone validation: must be 10 digits
    if (!/^\d{10}$/.test(studentDetails.phnNo)) {
      alert("Please enter a valid 10 digit phone number.");
      return false;
    }
    try {
      console.log("clicked submit button");
      setLoader(true);
      // This array will store the productIds of products where quantity > presentQuantity
      let productsWithExcessQuantity = [];

      products.forEach((product) => {
        // Parse the quantity and presentQuantity to numbers
        const quantity = parseInt(product.quantity, 10);
        const presentQuantity = parseInt(product.presentQuantity, 10);

        // Check if quantity is greater than presentQuantity
        if (quantity > presentQuantity) {
          // Add productId to the array
          productsWithExcessQuantity.push(product.productId);
        }
      });

      // Check if there are any products with excess quantity and send a combined message
      if (productsWithExcessQuantity.length > 0) {
        setLoader(false);
        // Join the productIds into a single string for the message
        const productIdsString = productsWithExcessQuantity.join(", ");
        alert(
          `Product IDs with quantity greater than present quantity: ${productIdsString}`
        );
        // Here you can handle the combined alert, such as sending an email or a notification
      } else {
        console.log("No products have quantity greater than present quantity.");

        const convertedProducts = products.map((product) => {
          return {
            quantity: parseInt(product.quantity) || 0, // Assuming quantity is a string representing an integer
            description: `${product.productName || "Product"},  Size: ${
              product.size || "N/A"
            }`,
            // "tax-rate": 6, // Assuming a fixed tax rate of 6%
            price: parseFloat(product.price) || 0.0, // Assuming price is a string representing a float
          };
        });

        const currentDate = new Date();
        const formattedCurrentDate = formatDate(currentDate);

        const data = {
          apiKey:
            "ndGS8p9qREq8LU72Va2UrraCMRqtThCTGRd9NSRDoTl9RAO7hAmjw2fBnal7KtXi",
          images: {
            // The logo on top of your invoice
            logo: "https://dresscode-invoices.s3.ap-south-1.amazonaws.com/logos/dressCode_Logo.png",
          },
          // Your own data
          sender: {
            // company: "DressCode",
            company: "Raj Selections",
            address: "Address:-Opp IB, Zaheerabad,502220.",
            zip: "Email ID:- info@dress-code.in",
            city: "7447444481",
            country: "GST No:- 36AESPJ6764L1ZN",
          },
          // Your recipient
          client: {},
          information: {
            // Invoice number
            number: "2021.0001",
            // Invoice data
            date: formattedCurrentDate,
            // Invoice due date
          },
          // The products you would like to see on your invoice
          // Total values are being calculated automatically
          products: convertedProducts,
          // The message you would like to display on the bottom of your invoice
          "bottom-notice": "Visit us at dress-code.in",
          // Settings to customize your invoice
          settings: {
            currency: "INR",
          },
        };

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/billing/createNewBill`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentName: studentDetails.studentName,
              class: studentDetails.class,
              rollNo: studentDetails.rollNo,
              emailId: studentDetails.emailId,
              phnNo: studentDetails.phnNo,
              modeOfPayment: studentDetails.mode_of_payment,
              products: products,
              orderedDate: formattedCurrentDate,
              totalPrice: totalPrice,
            }),
          }
        );

        if (response.ok) {
          // Handle success
          const responseBody = await response.json();
          console.log("Bill created successfully");
          data.information.number = "RAJ000" + responseBody.orderId;
          data.client.company = `Name :-${studentDetails.studentName}`;
          data.client.address = `Class:-${studentDetails.class}`;
          data.client.zip = `Roll No:-${
            studentDetails.rollNo ? studentDetails.rollNo : "---"
          }`;
          data.client.city = `Email ID:-${
            studentDetails.emailId ? studentDetails.emailId : "---"
          }`;
          data.client.country = `Mobile No:-${studentDetails.phnNo}`;
          const result = await easyinvoice.createInvoice(data);
          const pdfBlob = b64toBlob(result.pdf, "application/pdf");

          const pdfFormData = new FormData();
          pdfFormData.append("pdf", pdfBlob, "RAJ000" + responseBody.orderId);

          const whatsappFormData = new FormData();
          whatsappFormData.append(
            "file",
            pdfBlob,
            "RAJ000" + responseBody.orderId + ".pdf"
          );
          whatsappFormData.append("messaging_product", "whatsapp");

          const uploadResponse = await fetch(
            `${import.meta.env.VITE_BASE_URL}/billing/uploadToS3`,
            {
              method: "POST",
              body: pdfFormData,
            }
          );

          if (!uploadResponse.ok) {
            console.error(
              `HTTP error during upload to S3! Status: ${uploadResponse.status}`
            );
          }

          // const uploadData = await uploadResponse.json();
          // console.log('Upload to S3 successful', uploadData);

          // Post to Facebook Graph API
          const fbResponse = await fetch(
            `https://graph.facebook.com/v13.0/${
              import.meta.env.VITE_WHATSAPP_ID
            }/media`,
            {
              method: "POST",
              body: whatsappFormData,
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
              },
            }
          );

          if (!fbResponse.ok) {
            console.error(
              `HTTP error during Facebook Graph API request! Status: ${fbResponse.status}`
            );
          }

          const fbData = await fbResponse.json();

          const whatsappData = {
            messaging_product: "whatsapp",
            to: "91" + studentDetails.phnNo,
            type: "template",
            template: {
              name: "pdf_sender",
              language: {
                code: "en",
              },
              components: [
                {
                  type: "header",
                  parameters: [
                    {
                      type: "document",
                      document: {
                        id: fbData.id,
                      },
                    },
                  ],
                },
              ],
            },
          };

          const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${
              import.meta.env.VITE_WHATSAPP_ID
            }/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(whatsappData),
            }
          );

          const whatsappResponseData = await whatsappResponse.json();

          if (!whatsappResponse.ok) {
            console.error(
              `Error in sending whatsapp message! status:${whatsappResponse.status}`
            );
            if (whatsappResponseData.error.message.includes("incapable")) {
              toast.error(
                `${studentDetails.phnNo} incapable of receving WhatsApp message.`
              );
            }
          } else {
            toast.success("Invoice sent successfully via  WhatsApp!");
          }

          if (studentDetails.emailId) {
            const formData = new FormData();
            formData.append("pdf", pdfBlob, "invoice.pdf");
            formData.append("to", studentDetails.emailId); // The recipient's email address
            formData.append("subject", "Your Invoice is ready!");
            formData.append("text", "Please find the attached invoice.");

            fetch(`${import.meta.env.VITE_BASE_URL}/billing/sendEmail`, {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                toast.success("Invoice sent successfully via Email!");
              })
              .catch((error) => {
                console.error("Error sending email", error);
                // toast.error("Failed to send invoce to Mail");
              });
          }

          easyinvoice.download("myInvoice.pdf", result.pdf);
          setLoader(false);
          toast.success("Invoice downloaded successfully");
          clearFields();
        } else {
          // Handle error
          console.error("Failed to create bill");
          toast.error("Error in Billing");
          clearFields();
          setLoader(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Helper function to convert base64 to Blob
  function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  return (
    <div className="billing_box">
      <Loader />
      {availableProductsNms.length !== 0 ? (
        <div className="w-full text-left border-separate border-spacing-y-2.5">
          <div
            className="flex flex-col gap-10 bg-white p-5 overflow-x-auto custom-scrollbar"
            style={{ borderRadius: "4px" }}
          >
            <div className={`flex justify-between`}>
              <div className={`flex items-center gap-2}`}>
                <p className="font-semibold text-20 mr-2">Executive Name:</p>
                <p>{executiveName}</p>
              </div>
            </div>

            <form
              onSubmit={(event) => submitBill(event)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="student_name"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Student name * :
                  </label>
                  <input
                    type="text"
                    id="student_name"
                    name="studentName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
                    placeholder="Entire Student Name"
                    value={studentDetails.studentName}
                    onChange={onChangeInput}
                    required
                  />
                </div>
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="class"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Class * :
                  </label>
                  <input
                    type="text"
                    id="class"
                    name="class"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
                    placeholder="Entire Class"
                    value={studentDetails.class}
                    onChange={onChangeInput}
                    required
                  />
                </div>
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="roll_no"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Roll No :
                  </label>
                  <input
                    type="text"
                    id="roll_no"
                    name="rollNo"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
                    placeholder="Entire Roll No"
                    onChange={onChangeInput}
                    value={studentDetails.rollNo}
                  />
                </div>
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="eamil_id"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Eamil Id :
                  </label>
                  <input
                    type="email"
                    id="eamil_id"
                    name="emailId"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
                    placeholder="Entire Email Id"
                    onChange={onChangeInput}
                    value={studentDetails.emailId}
                  />
                </div>
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="phn_no"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Mobile No * :
                  </label>
                  <input
                    type="text"
                    id="phn_no"
                    name="phnNo"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:placeholder-gray-400"
                    placeholder="Entire WhatsApp Number"
                    value={studentDetails.phnNo}
                    onChange={onChangeInput}
                    required
                  />
                </div>
                <div
                  className={`flex  ${
                    isSmallScreen ? "flex-col" : "items-center"
                  }`}
                >
                  <label
                    htmlFor="phn_no"
                    className=" font-semibold text-20 mr-2"
                    style={{ width: "11vw" }}
                  >
                    Mode of payment * :
                  </label>
                  <select
                    name="mode_of_payment"
                    id="mode_of_payment"
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
                      !selectedPayment
                        ? "text-gray-400"
                        : "dark:placeholder-gray-400"
                    }`}
                    value={selectedPayment}
                    onChange={onChangeInput}
                    required
                  >
                    <option value="">Select Mode of Payment</option>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">Gpay</option>
                  </select>
                </div>
              </div>

              <div className="heading-row">
                <div className="text__Fld text-center font-semibold text-20">
                  Product Name
                </div>
                <div className="text__Fld text-center font-semibold text-20">
                  Size
                </div>
                <div className="auto__Fld text-center font-semibold text-20">
                  Product Id
                </div>
                <div className="text__Fld text-center font-semibold text-20">
                  MRP
                </div>
                <div className="text__Fld text-center font-semibold text-20">
                  Order Quantity
                </div>
                <div className="sbt__Btn text-center font-semibold text-20">
                  Actions
                </div>
              </div>
              {products.map((product, index) => (
                <>
                  <div key={index} className="product-details-row">
                    <Autocomplete
                      className="auto__Fld"
                      options={availableProductsNms}
                      value={product.productName}
                      onChange={(event, newValue) =>
                        handleProductChange(index, "productName", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Product Name"
                          variant="outlined"
                          fullWidth
                          required
                        />
                      )}
                    />
                    <Autocomplete
                      className="auto__Fld"
                      options={availableSizes}
                      value={product.size}
                      onChange={(event, newValue) =>
                        handleProductChange(index, "size", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Size"
                          variant="outlined"
                          fullWidth
                          required
                        />
                      )}
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.productId}
                      onChange={(e) =>
                        handleProductChange(index, "productId", e.target.value)
                      }
                      placeholder="Enter Product Id"
                      autoComplete="off"
                      name="productId"
                      disabled
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(index, "price", e.target.value)
                      }
                      placeholder="Price"
                      autoComplete="off"
                      name="price"
                      disabled
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      placeholder="Enter Order Quantity"
                      required
                      autoComplete="off"
                      name="quantity"
                    />
                    <button
                      type="button" // Ensure this button doesn't submit the form
                      className="remove-btn"
                      onClick={() => handleRemoveProduct(index)}
                      style={{ color: "red" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div key={index} className="product-details-col">
                    <div className="deatails__Fld">
                      <p>Product Name</p>
                      <Autocomplete
                        className="auto__Fld"
                        options={availableProductsNms}
                        value={product.productName}
                        onChange={(event, newValue) =>
                          handleProductChange(index, "productName", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Product Name"
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Size</p>
                      <Autocomplete
                        className="auto__Fld"
                        options={availableSizes}
                        value={product.size}
                        onChange={(event, newValue) =>
                          handleProductChange(index, "size", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Size"
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Product Id</p>
                      <TextField
                        className="text__Fld"
                        status="text"
                        value={product.productId}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        placeholder="Enter Product Id"
                        autoComplete="off"
                        name="productId"
                        disabled
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>MRP</p>
                      <TextField
                        className="text__Fld"
                        status="text"
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(index, "price", e.target.value)
                        }
                        placeholder="Price"
                        autoComplete="off"
                        name="price"
                        disabled
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Order Quantity</p>
                      <TextField
                        className="text__Fld"
                        status="integer"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        placeholder="Enter Order Quantity"
                        required
                        autoComplete="off"
                        name="quantity"
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Actions</p>
                      <button
                        type="button"
                        className="remove-btn "
                        onClick={() => handleRemoveProduct(index)}
                        style={{ color: "red" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ))}
              <div className={`flex justify-between flex-row-reverse`}>
                <div className="add__Btn" onClick={addProduct}>
                  <button type="button">Add Products</button>
                </div>
              </div>
              <div className="total-price flex gap-1">
                <p className="font-semibold text-20">Total Price :</p>
                <p>{totalPrice}</p>
              </div>
              <div className="genBill__Btn">
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <p
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No products for billing
        </p>
      )}
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default Billing;
