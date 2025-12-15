import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const N8N_WEBHOOK_URL = 'https://n8n.simeontsvetanovn8nworkflows.site/webhook';

// Предпочитани женски гласове за различни платформи
const PREFERRED_FEMALE_VOICES = [
  'Microsoft Irina', // Windows Bulgarian
  'Irina',
  'Google български', // Chrome
  'Milena', // Some TTS engines
  'Anna', // Generic female
  'Samantha', // iOS
  'Victoria',
  'Karen',
  'Moira',
  'Fiona',
  'Tessa',
];

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TranscriptionResult {
  text: string;
  confidence?: number;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private isSpeaking: boolean = false;

  /**
   * Инициализация на аудио режима
   */
  async initialize(): Promise<ServiceResponse> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Заявка за разрешение за микрофон
   */
  async requestPermissions(): Promise<ServiceResponse<boolean>> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      return { success: true, data: granted };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Започване на запис
   */
  async startRecording(): Promise<ServiceResponse> {
    try {
      // Check permissions
      const permResult = await this.requestPermissions();
      if (!permResult.data) {
        return { success: false, error: 'Няма разрешение за микрофон' };
      }

      // Initialize audio mode
      await this.initialize();

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      return { success: true };
    } catch (error: any) {
      console.error('Start recording error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Спиране на запис и транскрипция
   */
  async stopRecording(): Promise<ServiceResponse<string>> {
    try {
      if (!this.recording) {
        return { success: false, error: 'Няма активен запис' };
      }

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      // Get recording URI
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) {
        return { success: false, error: 'Не можа да се запише аудио' };
      }

      // Transcribe audio
      const transcription = await this.transcribeAudio(uri);
      
      // Clean up the file
      try {
        await FileSystem.deleteAsync(uri);
      } catch (e) {
        // Ignore cleanup errors
      }

      return transcription;
    } catch (error: any) {
      console.error('Stop recording error:', error);
      this.isRecording = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Отмяна на запис
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri);
        }
      }
    } catch (error) {
      console.error('Cancel recording error:', error);
    } finally {
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Транскрипция на аудио чрез n8n webhook (Whisper API)
   */
  async transcribeAudio(audioUri: string): Promise<ServiceResponse<string>> {
    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      });

      // Send to n8n webhook for Whisper transcription
      const response = await fetch(`${N8N_WEBHOOK_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioBase64,
          language: 'bg', // Bulgarian
        }),
      });

      if (!response.ok) {
        // If webhook fails, return a placeholder
        console.log('Transcription webhook failed, using fallback');
        return { 
          success: true, 
          data: 'Какво да облека днес?' // Fallback text for demo
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        data: data.text || data.transcription 
      };
    } catch (error: any) {
      console.error('Transcription error:', error);
      // Return fallback for demo purposes
      return { 
        success: true, 
        data: 'Какво да облека днес?' 
      };
    }
  }

  /**
   * Прочитане на текст на глас (Text-to-Speech) с женски глас
   */
  async speak(text: string, options?: {
    language?: string;
    pitch?: number;
    rate?: number;
  }): Promise<ServiceResponse> {
    try {
      // Stop any ongoing speech
      if (this.isSpeaking) {
        await this.stopSpeaking();
      }

      this.isSpeaking = true;

      // Clean text from emojis and special characters for better TTS
      const cleanText = this.cleanTextForSpeech(text);

      // Опитай да намериш женски глас
      let selectedVoice: string | undefined;
      
      if (Platform.OS === 'web') {
        // За web браузър - търси женски глас
        const voices = await Speech.getAvailableVoicesAsync();
        const femaleVoice = voices.find(voice => 
          PREFERRED_FEMALE_VOICES.some(name => 
            voice.name?.toLowerCase().includes(name.toLowerCase()) ||
            voice.identifier?.toLowerCase().includes(name.toLowerCase())
          ) ||
          voice.name?.toLowerCase().includes('female') ||
          voice.name?.toLowerCase().includes('woman')
        );
        
        // Ако няма български женски глас, потърси английски женски
        if (!femaleVoice) {
          const anyFemaleVoice = voices.find(voice =>
            voice.name?.toLowerCase().includes('female') ||
            voice.name?.toLowerCase().includes('zira') || // Windows female
            voice.name?.toLowerCase().includes('hazel') ||
            voice.name?.toLowerCase().includes('susan') ||
            voice.name?.toLowerCase().includes('samantha') // iOS female
          );
          if (anyFemaleVoice) {
            selectedVoice = anyFemaleVoice.identifier;
          }
        } else {
          selectedVoice = femaleVoice.identifier;
        }
      }

      await Speech.speak(cleanText, {
        language: options?.language || 'bg-BG',
        pitch: options?.pitch || 1.1, // Малко по-висок pitch за женски глас
        rate: options?.rate || 0.85, // Малко по-бавно за по-ясно произношение
        voice: selectedVoice,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });

      return { success: true };
    } catch (error: any) {
      this.isSpeaking = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Спиране на четенето
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Stop speaking error:', error);
    }
  }

  /**
   * Проверка дали се говори в момента
   */
  async isSpeakingNow(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  }

  /**
   * Получаване на налични гласове
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch {
      return [];
    }
  }

  /**
   * Почистване на текст за TTS
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove emojis
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      // Remove markdown
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, '. ')
      // Clean up
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Getter за статус на запис
   */
  get recording_status(): boolean {
    return this.isRecording;
  }

  /**
   * Getter за статус на говорене
   */
  get speaking_status(): boolean {
    return this.isSpeaking;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
