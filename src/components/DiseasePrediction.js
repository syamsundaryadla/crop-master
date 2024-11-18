import { useState, useRef } from "react";
import Nav from "./Nav";

// List of class labels with numbering
const classLabels = [
  'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
  'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 
  'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot', 
  'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 
  'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy', 
  'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 
  'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 
  'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 
  'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 
  'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
];

const DiseasePrediction = () => {
    const inputRef = useRef(null);
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // To show a loading state

    const handleImageClick = () => {
        inputRef.current.click();
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setPrediction(null);  // Reset prediction when a new image is uploaded
            setError("");          // Clear error message
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            setError("Please upload an image before submitting.");
            return;
        }

        setLoading(true);  // Start loading spinner or indicator

        const formData = new FormData();
        formData.append("file", image);

        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const predictedClassIndex = data.predicted_class; // Assuming prediction returns index
                const predictedLabel = classLabels[predictedClassIndex - 1]; // Map index to class label
                setPrediction(predictedLabel);
                setError("");  // Clear any previous errors
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to get prediction. Try again.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);  // Stop loading spinner
        }
    };

    return (
        <div className="container disease-predictor">
            <Nav />
            <div className="row dis-container">
                <div className="col-lg-6 col-md-6 dis-img-txt">
                    <h2>Disease Predictor</h2>
                    <p>To use our disease predictor, follow these simple steps:</p>
                    <ol>
                        <li>Upload Image: Click on the "Upload Image" button and select the image of the disease you want to analyze.</li>
                        <li>Submit Image: After selecting the image, click on the "Submit" button.</li>
                        <li>View Results: Once the image is processed, the results will be displayed.</li>
                    </ol>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
                <div className="col-lg-6 col-md-6 disease-img-container">
                    <div className="disease-img">
                        {image ? (
                            <img src={URL.createObjectURL(image)} alt="" />
                        ) : (
                            <img src="https://th.bing.com/th/id/R.712037bab8634a63b94c4cd1d22dc141" alt="Placeholder" />
                        )}
                        <input type="file" ref={inputRef} onChange={handleImageChange} style={{ display: "none" }} />
                        <br />
                        <button onClick={handleImageClick} className="btn dis-btn">Upload</button>
                        <button onClick={handleSubmit} className="btn dis-btn" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                    {prediction !== null && (
                        <div className="prediction-result">
                            <h3>Prediction: {prediction}</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseasePrediction;
