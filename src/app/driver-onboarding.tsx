import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInRight,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Upload,
  Camera,
  FileText,
  Car,
  Shield,
  CreditCard,
  User,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { toast } from '@/components/Toast';
import { MTQ_REQUIREMENTS } from '@/lib/quebec-taxi';

type OnboardingStep = 'personal' | 'license' | 'vehicle' | 'insurance' | 'review';

interface DocumentUpload {
  uri: string | null;
  name: string;
  verified: boolean;
}

interface DriverFormData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  // License
  licenseNumber: string;
  licenseExpiry: string;
  licenseClass: string;
  licensePhoto: DocumentUpload;
  // Permit
  permitNumber: string;
  permitExpiry: string;
  permitPhoto: DocumentUpload;
  // Vehicle
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleVin: string;
  vehiclePhoto: DocumentUpload;
  registrationPhoto: DocumentUpload;
  // Insurance
  insuranceCompany: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  insuranceCoverage: string;
  insurancePhoto: DocumentUpload;
  // Background check
  backgroundCheckConsent: boolean;
}

const initialFormData: DriverFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  licenseNumber: '',
  licenseExpiry: '',
  licenseClass: '',
  licensePhoto: { uri: null, name: 'Driver\'s License', verified: false },
  permitNumber: '',
  permitExpiry: '',
  permitPhoto: { uri: null, name: 'Taxi Permit (4C)', verified: false },
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehiclePlate: '',
  vehicleColor: '',
  vehicleVin: '',
  vehiclePhoto: { uri: null, name: 'Vehicle Photo', verified: false },
  registrationPhoto: { uri: null, name: 'Vehicle Registration', verified: false },
  insuranceCompany: '',
  insurancePolicy: '',
  insuranceExpiry: '',
  insuranceCoverage: '',
  insurancePhoto: { uri: null, name: 'Insurance Certificate', verified: false },
  backgroundCheckConsent: false,
};

const steps: { id: OnboardingStep; title: string; icon: React.ReactNode }[] = [
  { id: 'personal', title: 'Personal Info', icon: <User size={20} color="#FBBF24" /> },
  { id: 'license', title: 'License & Permit', icon: <FileText size={20} color="#FBBF24" /> },
  { id: 'vehicle', title: 'Vehicle Info', icon: <Car size={20} color="#FBBF24" /> },
  { id: 'insurance', title: 'Insurance', icon: <Shield size={20} color="#FBBF24" /> },
  { id: 'review', title: 'Review', icon: <CheckCircle size={20} color="#FBBF24" /> },
];

export default function DriverOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateField = <K extends keyof DriverFormData>(
    field: K,
    value: DriverFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast.success('Application Submitted', 'We\'ll review your documents within 24-48 hours.');
    router.back();
  };

  const simulateUpload = async (
    field: 'licensePhoto' | 'permitPhoto' | 'vehiclePhoto' | 'registrationPhoto' | 'insurancePhoto'
  ) => {
    // Simulate photo upload
    const newDoc: DocumentUpload = {
      uri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400',
      name: formData[field].name,
      verified: false,
    };
    updateField(field, newDoc);
    toast.success('Document Uploaded', 'Pending verification');
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default'
  ) => (
    <View className="mb-4">
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
        className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
      />
    </View>
  );

  const renderDocumentUpload = (
    doc: DocumentUpload,
    onUpload: () => void
  ) => (
    <Pressable
      onPress={onUpload}
      className={`bg-gray-800 border-2 border-dashed rounded-xl p-4 mb-4 ${
        doc.uri ? 'border-green-500' : 'border-gray-600'
      }`}
    >
      {doc.uri ? (
        <View className="flex-row items-center">
          <Image
            source={{ uri: doc.uri }}
            className="w-16 h-16 rounded-lg"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white font-medium">{doc.name}</Text>
            <View className="flex-row items-center mt-1">
              {doc.verified ? (
                <>
                  <CheckCircle size={14} color="#22C55E" />
                  <Text className="text-green-500 text-sm ml-1">Verified</Text>
                </>
              ) : (
                <>
                  <AlertCircle size={14} color="#FBBF24" />
                  <Text className="text-amber-500 text-sm ml-1">Pending verification</Text>
                </>
              )}
            </View>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </View>
      ) : (
        <View className="items-center py-4">
          <View className="bg-gray-700 rounded-full p-3 mb-3">
            <Upload size={24} color="#9CA3AF" />
          </View>
          <Text className="text-white font-medium">{doc.name}</Text>
          <Text className="text-gray-500 text-sm mt-1">Tap to upload</Text>
        </View>
      )}
    </Pressable>
  );

  const renderPersonalStep = () => (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text className="text-white text-xl font-bold mb-2">Personal Information</Text>
      <Text className="text-gray-400 mb-6">
        Enter your personal details as they appear on your ID.
      </Text>

      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">First Name</Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(v) => updateField('firstName', v)}
            placeholder="John"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">Last Name</Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(v) => updateField('lastName', v)}
            placeholder="Doe"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
      </View>

      {renderInput(
        'Email Address',
        formData.email,
        (v) => updateField('email', v),
        'john@example.com',
        'email-address'
      )}

      {renderInput(
        'Phone Number',
        formData.phone,
        (v) => updateField('phone', v),
        '+1 (514) 555-0123',
        'phone-pad'
      )}

      {renderInput(
        'Date of Birth',
        formData.dateOfBirth,
        (v) => updateField('dateOfBirth', v),
        'YYYY-MM-DD'
      )}
    </Animated.View>
  );

  const renderLicenseStep = () => (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text className="text-white text-xl font-bold mb-2">License & Permit</Text>
      <Text className="text-gray-400 mb-6">
        Upload your Quebec driver's license and taxi permit (Class {MTQ_REQUIREMENTS.permitClass}).
      </Text>

      <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
        <View className="flex-row items-start">
          <AlertCircle size={20} color="#FBBF24" />
          <Text className="text-amber-200 text-sm ml-3 flex-1">
            You must have held a valid Quebec Class 5 license for at least{' '}
            {MTQ_REQUIREMENTS.minLicenseMonths} months.
          </Text>
        </View>
      </View>

      <Text className="text-white font-semibold mb-3">Driver's License</Text>
      {renderDocumentUpload(formData.licensePhoto, () => simulateUpload('licensePhoto'))}

      {renderInput(
        'License Number',
        formData.licenseNumber,
        (v) => updateField('licenseNumber', v),
        'A1234-567890-12'
      )}

      {renderInput(
        'License Expiry',
        formData.licenseExpiry,
        (v) => updateField('licenseExpiry', v),
        'YYYY-MM-DD'
      )}

      <Text className="text-white font-semibold mb-3 mt-4">Taxi Permit (4C)</Text>
      {renderDocumentUpload(formData.permitPhoto, () => simulateUpload('permitPhoto'))}

      {renderInput(
        'Permit Number',
        formData.permitNumber,
        (v) => updateField('permitNumber', v),
        'T-12345'
      )}

      {renderInput(
        'Permit Expiry',
        formData.permitExpiry,
        (v) => updateField('permitExpiry', v),
        'YYYY-MM-DD'
      )}
    </Animated.View>
  );

  const renderVehicleStep = () => (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text className="text-white text-xl font-bold mb-2">Vehicle Information</Text>
      <Text className="text-gray-400 mb-6">
        Your vehicle must be less than {MTQ_REQUIREMENTS.maxVehicleAge} years old and pass annual inspection.
      </Text>

      <Text className="text-white font-semibold mb-3">Vehicle Photo</Text>
      {renderDocumentUpload(formData.vehiclePhoto, () => simulateUpload('vehiclePhoto'))}

      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">Make</Text>
          <TextInput
            value={formData.vehicleMake}
            onChangeText={(v) => updateField('vehicleMake', v)}
            placeholder="Toyota"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">Model</Text>
          <TextInput
            value={formData.vehicleModel}
            onChangeText={(v) => updateField('vehicleModel', v)}
            placeholder="Camry"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
      </View>

      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">Year</Text>
          <TextInput
            value={formData.vehicleYear}
            onChangeText={(v) => updateField('vehicleYear', v)}
            placeholder="2022"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-2">Color</Text>
          <TextInput
            value={formData.vehicleColor}
            onChangeText={(v) => updateField('vehicleColor', v)}
            placeholder="Black"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
          />
        </View>
      </View>

      {renderInput(
        'License Plate',
        formData.vehiclePlate,
        (v) => updateField('vehiclePlate', v),
        'ABC 123'
      )}

      {renderInput(
        'VIN Number',
        formData.vehicleVin,
        (v) => updateField('vehicleVin', v),
        '1HGBH41JXMN109186'
      )}

      <Text className="text-white font-semibold mb-3 mt-4">Vehicle Registration</Text>
      {renderDocumentUpload(formData.registrationPhoto, () => simulateUpload('registrationPhoto'))}
    </Animated.View>
  );

  const renderInsuranceStep = () => (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text className="text-white text-xl font-bold mb-2">Insurance</Text>
      <Text className="text-gray-400 mb-6">
        Commercial taxi insurance with minimum ${(MTQ_REQUIREMENTS.minInsuranceCoverage / 1000000).toFixed(0)}M coverage is required.
      </Text>

      <Text className="text-white font-semibold mb-3">Insurance Certificate</Text>
      {renderDocumentUpload(formData.insurancePhoto, () => simulateUpload('insurancePhoto'))}

      {renderInput(
        'Insurance Company',
        formData.insuranceCompany,
        (v) => updateField('insuranceCompany', v),
        'Intact Insurance'
      )}

      {renderInput(
        'Policy Number',
        formData.insurancePolicy,
        (v) => updateField('insurancePolicy', v),
        'POL-123456789'
      )}

      {renderInput(
        'Expiry Date',
        formData.insuranceExpiry,
        (v) => updateField('insuranceExpiry', v),
        'YYYY-MM-DD'
      )}

      {renderInput(
        'Coverage Amount',
        formData.insuranceCoverage,
        (v) => updateField('insuranceCoverage', v),
        '$1,000,000',
        'numeric'
      )}

      {/* Background Check Consent */}
      <View className="mt-6">
        <Text className="text-white font-semibold mb-3">Background Check</Text>
        <Pressable
          onPress={() => updateField('backgroundCheckConsent', !formData.backgroundCheckConsent)}
          className="bg-gray-800 rounded-xl p-4 flex-row items-start"
        >
          <View
            className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
              formData.backgroundCheckConsent
                ? 'bg-amber-500 border-amber-500'
                : 'border-gray-600'
            }`}
          >
            {formData.backgroundCheckConsent && <Check size={16} color="#000" />}
          </View>
          <Text className="text-gray-300 flex-1 text-sm">
            I consent to a criminal background check as required by MTQ regulations. I understand
            this is mandatory for all taxi drivers in Quebec.
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderReviewStep = () => (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text className="text-white text-xl font-bold mb-2">Review Your Application</Text>
      <Text className="text-gray-400 mb-6">
        Please review your information before submitting.
      </Text>

      {/* Personal Info Summary */}
      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <User size={18} color="#FBBF24" />
          <Text className="text-white font-semibold ml-2">Personal Information</Text>
        </View>
        <Text className="text-gray-400 text-sm">
          {formData.firstName} {formData.lastName}
        </Text>
        <Text className="text-gray-400 text-sm">{formData.email}</Text>
        <Text className="text-gray-400 text-sm">{formData.phone}</Text>
      </View>

      {/* License Summary */}
      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <FileText size={18} color="#FBBF24" />
          <Text className="text-white font-semibold ml-2">License & Permit</Text>
        </View>
        <Text className="text-gray-400 text-sm">License: {formData.licenseNumber || 'Not provided'}</Text>
        <Text className="text-gray-400 text-sm">Permit: {formData.permitNumber || 'Not provided'}</Text>
        <View className="flex-row mt-2">
          <View className={`flex-row items-center mr-4 ${formData.licensePhoto.uri ? 'opacity-100' : 'opacity-50'}`}>
            {formData.licensePhoto.uri ? (
              <CheckCircle size={14} color="#22C55E" />
            ) : (
              <X size={14} color="#EF4444" />
            )}
            <Text className="text-gray-400 text-xs ml-1">License Photo</Text>
          </View>
          <View className={`flex-row items-center ${formData.permitPhoto.uri ? 'opacity-100' : 'opacity-50'}`}>
            {formData.permitPhoto.uri ? (
              <CheckCircle size={14} color="#22C55E" />
            ) : (
              <X size={14} color="#EF4444" />
            )}
            <Text className="text-gray-400 text-xs ml-1">Permit Photo</Text>
          </View>
        </View>
      </View>

      {/* Vehicle Summary */}
      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Car size={18} color="#FBBF24" />
          <Text className="text-white font-semibold ml-2">Vehicle</Text>
        </View>
        <Text className="text-gray-400 text-sm">
          {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
        </Text>
        <Text className="text-gray-400 text-sm">Plate: {formData.vehiclePlate || 'Not provided'}</Text>
      </View>

      {/* Insurance Summary */}
      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Shield size={18} color="#FBBF24" />
          <Text className="text-white font-semibold ml-2">Insurance</Text>
        </View>
        <Text className="text-gray-400 text-sm">{formData.insuranceCompany || 'Not provided'}</Text>
        <Text className="text-gray-400 text-sm">Policy: {formData.insurancePolicy || 'Not provided'}</Text>
      </View>

      {/* Background Check */}
      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <View className="flex-row items-center">
          {formData.backgroundCheckConsent ? (
            <CheckCircle size={18} color="#22C55E" />
          ) : (
            <AlertCircle size={18} color="#EF4444" />
          )}
          <Text className="text-white font-semibold ml-2">Background Check Consent</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return renderPersonalStep();
      case 'license':
        return renderLicenseStep();
      case 'vehicle':
        return renderVehicleStep();
      case 'insurance':
        return renderInsuranceStep();
      case 'review':
        return renderReviewStep();
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-gray-800"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={handleBack} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-lg font-bold ml-2 flex-1">Driver Registration</Text>
        <Text className="text-gray-400">
          {currentStepIndex + 1}/{steps.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-gray-800">
        <Animated.View
          className="h-full bg-amber-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Step Indicators */}
      <View className="flex-row justify-between px-6 py-4">
        {steps.map((step, index) => (
          <View key={step.id} className="items-center">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                index <= currentStepIndex ? 'bg-amber-500' : 'bg-gray-700'
              }`}
            >
              {index < currentStepIndex ? (
                <Check size={20} color="#000" />
              ) : (
                step.icon
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Actions */}
      <View
        className="px-4 pt-4 border-t border-gray-800"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {currentStep === 'review' ? (
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`py-4 rounded-xl items-center flex-row justify-center ${
              isSubmitting ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
            }`}
          >
            {isSubmitting ? (
              <Text className="text-black font-bold text-lg">Submitting...</Text>
            ) : (
              <>
                <Text className="text-black font-bold text-lg">Submit Application</Text>
                <Check size={20} color="#000" style={{ marginLeft: 8 }} />
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            className="bg-amber-500 py-4 rounded-xl items-center flex-row justify-center active:bg-amber-600"
          >
            <Text className="text-black font-bold text-lg">Continue</Text>
            <ArrowRight size={20} color="#000" style={{ marginLeft: 8 }} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
