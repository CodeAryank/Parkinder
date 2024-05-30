from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
from audio_processing import audio


app = Flask(__name__)
CORS(app)

with open('model/DecisionTree_model.pkl', 'rb') as f:
    model = pickle.load(f)

def print_message():
    return "Hello from flask"

audio_processor = audio()

def predict():
    features = audio_processor.audio_extraction()
    prediction = model.predict(features)
    return prediction.tolist()[0]



@app.route('/')
def index():
    return 'Hello Nigga'


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    data = request.get_json()
    
    confirmation = data.get('confirmation')

    if confirmation==1:
        message = predict()
        return jsonify({'message': message})
    else:
        return jsonify({'error':'Invalid confirmation'}), 400


@app.route('/get_results', methods=['GET'])
def get_results():
    confirmation = request.args.get('confirmation')

    if confirmation == '1':
        message = predict()
        return jsonify({'message': message})
    else:
        return jsonify({'error':'Invalid confirmation'}), 400



if __name__ == '__main__':
    app.run(debug=True)