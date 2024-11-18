import os
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this to allow requests from other domains like localhost:3000

# Load your trained model
model = load_model('./public/assets/model.keras')

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Image preprocessing function
def preprocess_image(image_path):
    img = load_img(image_path, target_size=(150, 150))  # Resizing image to match the input shape of the model
    img = img_to_array(img)
    img = np.expand_dims(img, axis=0)  # Adding batch dimension
    img /= 255.0  # Rescaling the image (same as during training)
    return img

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join('./uploads', filename)
        file.save(filepath)

        try:
            # Preprocess the image
            img = preprocess_image(filepath)

            # Make prediction
            predictions = model.predict(img)
            predicted_class = np.argmax(predictions, axis=1)

            # Return the result as JSON
            return jsonify({
                "predictions": predictions.tolist(),
                "predicted_class": int(predicted_class[0])
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file type"}), 400

if __name__ == "__main__":
    app.run(debug=True)
