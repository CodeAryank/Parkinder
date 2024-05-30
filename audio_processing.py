import pandas as pd
import numpy as np
import librosa
import librosa.display
# import pyAudioAnalysis
import python_speech_features as psf


class audio():
    
    def calculate_ppe(self,audio_file):

        y, sr = librosa.load(audio_file)

        pitch, magnitudes = librosa.core.piptrack(y=y, sr=sr)

        # Calculate pitch period entropy
        pitch_histogram, _ = np.histogram(pitch.flatten(), bins='auto', density=True)
        pitch_period_entropy = -np.sum(pitch_histogram * np.log2(pitch_histogram + 1e-10))

        return pitch_period_entropy

    def calculate_spread2(self,audio_file):
        y, sr = librosa.load(audio_file, sr=None)
        pitches, magnitudes = librosa.core.piptrack(y=y)
        pitch_contour = []
        for frame in pitches.T:
            nonzero_values = frame[frame > 0]
            if len(nonzero_values) > 0:
                pitch_contour.append(np.mean(nonzero_values))
            else:
                pitch_contour.append(0)

        # Calculate Spread2
        spread2 = np.std(np.diff(pitch_contour))/1000

        return spread2

    def calculate_shimmer(self,audio_file):
        y, sr = librosa.load(audio_file, sr=None, mono=True)

        # Calculate pitch using librosa
        pitches, magnitudes = librosa.core.piptrack(y=y)

        # Extract pitch contour
        pitch_contour = []
        for frame in pitches.T:
            nonzero_values = frame[frame > 0]
            if len(nonzero_values) > 0:
                pitch_contour.append(np.mean(nonzero_values))
            else:
                pitch_contour.append(0)

        # Calculate Shimmer
        shimmer = np.mean(np.abs(np.diff(pitch_contour)))

        # Normalize shimmer values
        normalized_shimmer = shimmer / np.max(pitch_contour)

    def extract_amplitude_feature(self,audio_signal):
        amplitude_feature = np.mean(np.abs(audio_signal))
        
        return amplitude_feature

    def extract_perturbation_feature(self,audio_signal):

        perturbation_feature = np.std(audio_signal)
        return perturbation_feature
    
    def calculate_mdvp_apq(self,audio_file_path):

        y, sr = librosa.load(audio_file_path)

        amplitude_feature = self.extract_amplitude_feature(y)
        perturbation_feature = self.extract_perturbation_feature(y)

        mdvp_apq = (amplitude_feature / perturbation_feature)/10

        return mdvp_apq
    
    def extract_amplitude_variation(self,audio_signal):
        # Replace this placeholder with the actual code to extract amplitude variation feature
        amplitude_variation = np.mean(np.abs(np.diff(audio_signal)))
        return amplitude_variation
    
    def calculate_mdvp_shimmer(self,audio_file_path):
        # Load the audio file
        y, sr = librosa.load(audio_file_path)

        # Extract relevant features using LibROSA or other libraries
        # Here, you may need to replace these placeholders with the actual feature extraction code
        amplitude_variation = self.extract_amplitude_variation(y)

        # Calculate MDVP:Shimmer based on the extracted features
        mdvp_shimmer = (amplitude_variation / np.mean(np.abs(y)))/10

        return mdvp_shimmer
    
    def calculate_average_f0(self,audio_file_path):
        y, sr = librosa.load(audio_file_path)
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))

        # Calculate the average F0
        average_f0 = np.mean(f0[voiced_flag])

        return average_f0
    
    def extract_amplitude_variation(self,audio_signal):
        # Replace this placeholder with the actual code to extract amplitude variation feature
        amplitude_variation = np.mean(np.abs(np.diff(audio_signal)))
        return amplitude_variation
    
    def calculate_shimmer_dda(self,audio_file_path):
        # Load the audio file
        y, sr = librosa.load(audio_file_path)

        # Extract relevant features using LibROSA or other libraries
        # Here, you may need to replace these placeholders with the actual feature extraction code
        amplitude_variation = self.extract_amplitude_variation(y)

        # Calculate Shimmer:DDA based on the extracted features
        shimmer_dda = (amplitude_variation / np.mean(np.abs(y)))/10

        return shimmer_dda
    
    def extract_shimmer_apq3(self,audio_file_path):
        # Load audio using librosa
        y, sr = librosa.load(audio_file_path)

        # Calculate the intensity (amplitude envelope)
        intensity = np.abs(librosa.stft(y))

        # Calculate the peak-to-peak amplitude differences
        delta_intensity = np.diff(intensity, axis=1)

        # Calculate Shimmer (APQ3)
        shimmer_values = np.mean(np.abs(delta_intensity), axis=1)

        # Calculate APQ3 (Average Shimmer in 3-sample window)
        shimmer_apq3 = np.mean(shimmer_values)/10

        return shimmer_apq3
    
    def extract_shimmer_apq5(self,audio_file_path):
        # Load audio using librosa
        y, sr = librosa.load(audio_file_path)

        # Calculate the intensity (amplitude envelope)
        intensity = np.abs(librosa.stft(y))

        # Calculate the peak-to-peak amplitude differences
        delta_intensity = np.diff(intensity, axis=1)

        # Calculate Shimmer (APQ5)
        shimmer_values = np.mean(np.abs(delta_intensity), axis=1)

        # Calculate APQ5 (Average Shimmer in 5-sample window)
        shimmer_apq5 = np.mean(shimmer_values)/10

        return shimmer_apq5
    
    def calculate_mdvp_flo(self,audio_file):
        y, sr = librosa.load(audio_file)
        flo = librosa.note_to_hz(librosa.hz_to_note(librosa.note_to_hz('C2')))
        return flo
    
    def extract_mdvp_shimmer_approx(self,audio_path, winlen=0.03, winstep=0.02):

        try:
            # Load MP3 audio using librosa
            y, sr = librosa.load(audio_path, sr=None)  # sr=None to avoid resampling

            # Extract MFCC features
            mfcc = psf.mfcc(y, sr, winlen=winlen, winstep=winstep)

            # Calculate average absolute difference of MFCCs (approximation)
            mfcc_diff = np.abs(mfcc[:, 1:] - mfcc[:, :-1])  # Consider using higher-order derivatives
            avg_diff = np.mean(mfcc_diff)

            # Convert to dB (assuming a reference level)
            reference_level = 1.0  # You might need to adjust this based on your application
            shimmer_db = (20 * np.log10(avg_diff / reference_level))/100

            return shimmer_db

        except Exception as e:
            print(f"Error extracting mdvp:shimmer (approx): {e}")
            return None
        
    def audio_extraction(self):

        audio_path = "recording.mp3"
        spread2_value = self.calculate_spread2(audio_path)
        pitch_period_entropy=self.calculate_ppe(audio_path)
        shimmer=self.calculate_shimmer(audio_path)
        mdvp_apq_value = self.calculate_mdvp_apq(audio_path)
        mdvp_shimmer_value = self.calculate_mdvp_shimmer(audio_path)
        f0_value = self.calculate_average_f0(audio_path)
        shimmer_apq3 = self.extract_shimmer_apq3(audio_path)
        shimmer_apq5 = self.extract_shimmer_apq5(audio_path)
        shimmer_dda_value = self.calculate_shimmer_dda(audio_path)
        flo_value=self.calculate_mdvp_flo(audio_path)
        mdvp_shimmer_db =self.extract_mdvp_shimmer_approx(audio_path)

        features=[[pitch_period_entropy,spread2_value,mdvp_shimmer_value,mdvp_apq_value,shimmer_apq5,shimmer_apq3,mdvp_shimmer_db,shimmer_dda_value,f0_value,flo_value,]]

        df_features=pd.DataFrame(features)
        df_features.columns=["PPE","spread2","MDVP:Shimmer","MDVP:APQ", "Shimmer:APQ5", "Shimmer:APQ3", "MDVP:Shimmer(dB)", "Shimmer:DDA", "MDVP:Fo(Hz)","MDVP:Flo(Hz)"]

        df_features.to_csv('output.csv', index=False)
        df = pd.read_csv('output.csv')

        return df


def main():
    # Create an instance of the audio class
    audio_instance = audio()

    # Call the audio_extraction method on the instance
    df = audio_instance.audio_extraction()
    print(df)

if __name__ == "__main__":
    main()








  



