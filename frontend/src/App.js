import React, { useState } from 'react';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        identityNumber: '',
        email: '',
        dateOfBirth: ''
    });

    const [errors, setErrors] = useState({});
    // Validasi dari backend harusnya cukup
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;


        if (!formData.name.trim()) {
            tempErrors.name = 'Name is required';
            isValid = false;
        }


        if (!formData.identityNumber.trim()) {
            tempErrors.identityNumber = 'Identity Number is required';
            isValid = false;
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            tempErrors.email = 'Valid email is required';
            isValid = false;
        }


        if (!formData.dateOfBirth) {
            tempErrors.dateOfBirth = 'Date of Birth is required';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateForm()) {
            return; // Hentikan proses jika validasi gagal
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setSubmitStatus({
                        type: 'error',
                        message: data.message || 'Something went wrong'
                    });
                }
            } else {
                setSubmitStatus({
                    type: 'success',
                    message: 'Registration successful!'
                });
                // bersihkan input kalo udah berhasil
                setFormData({
                    name: '',
                    identityNumber: '',
                    email: '',
                    dateOfBirth: ''
                });
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Network error. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // bershikan input kalo error
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Registration Form</h2>

                {submitStatus && (
                    <div className={`p-4 rounded-md mb-6 ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {submitStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="identityNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Identity Number
                        </label>
                        <input
                            type="text"
                            id="identityNumber"
                            name="identityNumber"
                            value={formData.identityNumber}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.identityNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.identityNumber && <p className="mt-1 text-sm text-red-500">{errors.identityNumber}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;