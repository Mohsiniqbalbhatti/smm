import imap from "imap"; // For fetching emails (use 'imap-simple' or 'node-imap')
import UserModel from "../../model/User.model.js";
import CurrencyConvertorModel from "../../model/CurrencyConvertor.model.js";
import transaction from "../../model/TransactionLogs.model.js";
import SiteSettings from "../../model/SiteSettings.model.js";
import nodemailer from "nodemailer";

export const addJazzCashAutoPayment = async (req, res) => {
  // console.log("Received data from request body:", req.body); // Log the request body to verify received data

  try {
    const { transactionId, amount, userName, paymentMethod } = req.body;
    // console.log(
    //   "Parsed transactionId:",
    //   transactionId,
    //   "Parsed amount:",
    //   amount
    // ); // Confirm parsed transaction details

    const existingTrnasactionId = await transaction.findOne({
      transactionId: transactionId,
    });
    if (existingTrnasactionId) {
      // console.log("Transaction already exists. Skipping.");
      return res.status(202).json({
        message: "Transaction Id already Exist",
      });
    }

    // Fetch the latest email
    const emailBody = await fetchLatestEmail();
    // console.log("Fetched latest email content:", emailBody); // Log the email content for verification

    // Check if email was found
    if (!emailBody) {
      // console.log("No email found. Adding transaction with pending status.");

      // Create a transaction with pending status when email is not found
      await addPendingTransaction(
        transactionId,
        amount,
        userName,
        paymentMethod,
        "No email found"
      );
      return res.status(202).json({
        message: "Payment in pending: No email found",
      });
    }

    // Extract the transaction ID and amount from the email body
    const { extractedTransactionId, extractedAmount } =
      extractTransactionDetails(emailBody);
    // console.log(
    //   "Extracted transaction ID from email:",
    //   extractedTransactionId,
    //   "Extracted amount from email:",
    //   extractedAmount
    // ); // Log extracted values for comparison

    // Check if the extracted details are found
    if (!extractedTransactionId || !extractedAmount) {
      // console.log(
      //   "Transaction details not found in email. Adding transaction with pending status."
      // );

      // Create a transaction with pending status when details are not found in the email
      await addPendingTransaction(
        transactionId,
        amount,
        userName,
        paymentMethod,
        "Email not found"
      );
      return res.status(202).json({
        message: "Payment in pending: Transaction details not found in email",
      });
    }

    // Check if the extracted transaction ID and amount match the ones provided by the user
    if (
      transactionId === extractedTransactionId &&
      parseFloat(amount) === parseFloat(extractedAmount)
    ) {
      // If both match, find the user by userName and update their balance
      const user = await UserModel.findOne({ userName });
      if (user) {
        // Fetch PKR conversion rate assuming it's the USD to PKR rate
        const conversionData = await CurrencyConvertorModel.findOne({
          currency: "PKR",
        });
        const usdToPkrRate = conversionData ? conversionData.rate : null;

        if (!usdToPkrRate) {
          console.error("USD to PKR conversion rate not found.");
          return res
            .status(500)
            .json({ message: "Currency conversion rate not found." });
        }

        // Convert user balance from USD to PKR and update balance
        const balanceInPKR = user.balance * usdToPkrRate;
        const newBalanceInPKR = balanceInPKR + parseFloat(extractedAmount);
        const newBalanceInUSD = newBalanceInPKR / usdToPkrRate;

        await UserModel.findByIdAndUpdate(user._id, {
          balance: newBalanceInUSD,
        }); // Update balance with new value
        // console.log(
        //   "Funds added successfully.",
        //   "User:",
        //   userName,
        //   "New balance added:",
        //   parseFloat(extractedAmount),
        //   "Updated balance in USD:",
        //   newBalanceInUSD
        // );

        // Create transaction with success status
        const newTransaction = new transaction({
          user: user._id,
          userName: userName,
          transactionId: extractedTransactionId,
          amount: extractedAmount,
          paymentMethod: paymentMethod,
          currency: "PKR",
          status: "success",
        });
        await newTransaction.save();

        return res.status(200).json({ message: "Funds added successfully!" });
      } else {
        console.error("User not found.");
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // console.log(
      //   "Transaction ID or amount mismatch. No transaction history created."
      // );

      // Do not create a transaction with pending status if transaction ID or amount does not match
      return res.status(400).json({
        message: "Transaction ID or amount mismatch",
      });
    }
  } catch (error) {
    console.error("Error in verifying payment:", error); // Log any error encountered
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to add a pending transaction to the database
const addPendingTransaction = async (
  transactionId,
  amount,
  userName,
  paymentMethod,
  reason
) => {
  const user = await UserModel.findOne({ userName });
  const userId = user ? user._id : null;

  const pendingTransaction = new transaction({
    user: userId,
    userName: userName,
    transactionId: transactionId,
    amount: amount,
    paymentMethod: paymentMethod,
    currency: "PKR",
    status: "pending",
    reason: reason, // Optional field to store the reason for pending status
  });
  await pendingTransaction.save();

  const paymentId = pendingTransaction.paymentId;
  const emailFor = "pendingPaymentEmail";
  await mailSendingFunctionAdmin(userName, emailFor, paymentId);
};

// Function to fetch the latest email using IMAP
const fetchLatestEmail = async () => {
  try {
    // Fetch site settings dynamically
    const siteSettings = await SiteSettings.findOne();
    const adminEmail = siteSettings.email_from;
    const adminEmailPass = siteSettings.email_Password;

    return new Promise((resolve, reject) => {
      const imapConfig = {
        user: adminEmail, // using dynamically fetched email
        password: adminEmailPass, // using dynamically fetched password
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        connTimeout: 10000,
        authTimeout: 10000,
      };

      const imapClient = new imap(imapConfig);

      imapClient.once("ready", () => {
        imapClient.openBox("INBOX", false, (err, box) => {
          if (err) {
            console.error("Error opening inbox:", err);
            return reject(err);
          }

          const searchCriteria = ["UNSEEN", ["FROM", adminEmail]];
          imapClient.search(searchCriteria, (err, results) => {
            if (err) {
              console.error("Error searching messages:", err);
              return reject(err);
            }

            if (!results.length) {
              return resolve(null);
            }

            const fetch = imapClient.fetch(results, {
              bodies: "TEXT",
              struct: true,
              markSeen: true,
            });

            fetch.on("message", (msg, seqno) => {
              msg.on("body", (stream) => {
                let emailData = "";
                stream.on("data", (chunk) => {
                  emailData += chunk.toString("utf8");
                });

                stream.on("end", () => {
                  resolve(emailData);
                });
              });
            });

            fetch.once("end", () => {
              imapClient.end();
            });
          });
        });
      });

      imapClient.once("error", (err) => {
        console.error("IMAP connection error:", err.message);
        reject("IMAP connection error: " + err.message);
      });

      imapClient.connect();
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    throw error;
  }
};
// Function to extract transaction details from the email body using regex
const extractTransactionDetails = (emailBody) => {
  // console.log("Extracting transaction details from email body..."); // Log start of extraction
  // console.log("Email for extraction is:", emailBody); // Log full email content for verification

  // Regex pattern to match the transaction ID and amount in the format you provided
  const regex = /Rs\s(\d+\.\d{2})\sreceived.*?TID[:\s]?(\d+)/;

  const match = emailBody.match(regex);

  if (match) {
    // console.log("Transaction details extracted successfully."); // Log successful extraction
    return {
      extractedAmount: match[1], // Amount
      extractedTransactionId: match[2], // Transaction ID
    };
  } else {
    console.warn("No transaction details found in email body."); // Warn if extraction fails
    return {
      extractedTransactionId: null,
      extractedAmount: null,
    };
  }
};

// send mail to admin on pending payment
export const mailSendingFunctionAdmin = async (
  userName,
  emailFor,
  paymentId
) => {
  try {
    // Step 1: Fetch the site settings
    const siteSettings = await SiteSettings.findOne();
    if (!siteSettings) {
      throw new Error("Site settings not found");
    }

    // Check if the email template exists in siteSettings
    const template = siteSettings[emailFor];
    if (!template) {
      throw new Error(`Template '${emailFor}' not found in site settings`);
    }

    // Step 2: Extract subject and body from the template
    let { subject, body } = template;
    const adminMail = siteSettings.email_from;
    const adminMailPassword = siteSettings.email_Password; // App-specific password

    // Validate admin email and password
    if (!adminMail || !adminMailPassword) {
      throw new Error("Admin email or password is not set in site settings");
    }

    // Step 3: Fetch user details
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      throw new Error(`User '${userName}' not found`);
    }

    // Step 4: Replace placeholders in the email body
    const dataToReplace = {
      userName: user.userName,
      paymentId: paymentId,
    };

    body = replacePlaceholders(body, dataToReplace);

    // Step 5: Set up the nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminMail,
        pass: adminMailPassword, // App-specific password
      },
    });

    // Step 6: Define email options
    const mailOptions = {
      from: adminMail,
      to: adminMail, // Admin's email as the recipient
      subject: subject,
      html: body,
    };

    // Step 7: Send the email
    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully to admin");
    return { success: true, message: "Email sent successfully to admin" };
  } catch (error) {
    console.error("Error in mailSendingFunctionUser:", error.message);
    return { success: false, message: error.message };
  }
};

// Utility function to replace placeholders
const replacePlaceholders = (template, replacements) => {
  // Ensure the template is a string
  if (typeof template !== "string") {
    throw new Error("Template body must be a string");
  }
  // Replace placeholders like {{key}} with values from the replacements object
  return template.replace(
    /{{(.*?)}}/g,
    (_, key) => replacements[key.trim()] || `{{${key}}}`
  );
};
