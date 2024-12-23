import PaymentMethodsModel from "../model/PaymentMethods.model.js";

// Controller to fetch all payment methods
export const AllPaymentMethods = async (req, res) => {
  try {
    const PaymentMethods = await PaymentMethodsModel.find({});
    if (PaymentMethods.length > 0) {
      res.json({ PaymentMethods });
    } else {
      res.status(404).json({ message: "No payment methods found" });
    }
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update a specific payment method
export const updatePaymentMethod = async (req, res) => {
  const { methodId } = req.params; // Extracting the method ID from the URL parameters
  const updatedData = req.body; // The updated data from the frontend form

  try {
    // Find the payment method by ID and update it with the new data
    const paymentMethod = await PaymentMethodsModel.findByIdAndUpdate(
      methodId,
      updatedData,
      { new: true } // The `new` option returns the updated document
    );

    if (paymentMethod) {
      // Successfully updated the payment method
      res.json({
        message: "Payment method updated successfully",
        paymentMethod,
      });
    } else {
      // If no method is found with the given ID
      res.status(404).json({ message: "Payment method not found" });
    }
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const AllPaymentMethodsUser = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethodsModel.find({ status: true });

    if (paymentMethods.length > 0) {
      // Map each payment method into a format we want to return
      const formattedPaymentMethods = paymentMethods.map((method) => ({
        _id: method._id,
        method: method.method,
        name: method.name,
        min: method.min,
        max: method.max,
        img: method.img,
        accountTitle: method.params.get("accountTitle"),
        accountNumber: method.params.get("accountNumber"),
        userParams: method.userParams,
        routeName: method.routeName,
      }));

      res.json({
        paymentMethods: formattedPaymentMethods,
      });
    } else {
      res.status(404).json({ message: "No payment methods found" });
    }
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
