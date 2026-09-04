"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { AddressService, UserAddress } from "@/services/addressService";
import { Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import toast from "react-hot-toast";

const initialFormState: UserAddress = {
    type: 'home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
};

export default function AccountAddress() {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserAddress>(initialFormState);
    const [saving, setSaving] = useState(false);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const res = await AddressService.getAddresses();
            if (res.status && res.addresses) {
                setAddresses(res.addresses);
            }
        } catch (error: any) {
            console.error("Error loading addresses:", error);
            toast.error(error.message || "Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({
            ...initialFormState,
            isDefault: addresses.length === 0
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (addr: UserAddress) => {
        setEditingId(addr._id || null);
        setFormData({
            type: addr.type || 'home',
            fullName: addr.fullName || '',
            phone: addr.phone || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zipCode: addr.zipCode || '',
            country: addr.country || 'India',
            isDefault: addr.isDefault || false
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
            toast.error("Please fill in street, city, state, and ZIP code.");
            return;
        }

        try {
            setSaving(true);
            if (editingId) {
                const res = await AddressService.updateAddress(editingId, formData);
                if (res.status) {
                    toast.success("Address updated successfully!");
                    setAddresses(res.addresses);
                    handleCloseModal();
                }
            } else {
                const res = await AddressService.addAddress(formData);
                if (res.status) {
                    toast.success("Address added successfully!");
                    setAddresses(res.addresses);
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error("Error saving address:", error);
            toast.error(error.message || "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId?: string) => {
        if (!addressId) return;
        if (!window.confirm("Are you sure you want to remove this address?")) return;

        try {
            const res = await AddressService.deleteAddress(addressId);
            if (res.status) {
                toast.success("Address removed successfully!");
                setAddresses(res.addresses);
            }
        } catch (error: any) {
            console.error("Error deleting address:", error);
            toast.error(error.message || "Failed to delete address");
        }
    };

    const handleSetDefault = async (addressId?: string) => {
        if (!addressId) return;
        try {
            const res = await AddressService.setDefaultAddress(addressId);
            if (res.status) {
                toast.success("Default address updated!");
                setAddresses(res.addresses);
            }
        } catch (error: any) {
            console.error("Error setting default address:", error);
            toast.error(error.message || "Failed to set default address");
        }
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Account Address" parentText="Home" currentText="Account Address" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <section className="col-xl-9 account-wrapper">
                                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                    <div>
                                        <h4 className="mb-1 fw-bold">My Addresses</h4>
                                        <p className="text-muted small mb-0">
                                            Manage your shipping and billing addresses for fast checkout.
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleOpenAddModal}
                                    >
                                        <i className="fa-solid fa-plus me-2" />Add New Address
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <div className="text-muted mt-2">Loading addresses...</div>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-5 bg-white rounded border p-4">
                                        <div style={{ fontSize: '3rem' }}>📍</div>
                                        <h5 className="mt-3 mb-2">No Saved Addresses</h5>
                                        <p className="text-muted small mb-4">
                                            You haven't added any shipping or billing addresses yet.
                                        </p>
                                        <button className="btn btn-primary" onClick={handleOpenAddModal}>
                                            Add Your First Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {addresses.map((addr) => (
                                            <div key={addr._id} className="col-md-6 m-b30">
                                                <div 
                                                    className="address-card h-100 p-3 bg-white rounded border position-relative d-flex flex-column justify-content-between"
                                                    style={{ 
                                                        borderColor: addr.isDefault ? '#fdcb6e' : '#e2e8f0',
                                                        boxShadow: addr.isDefault ? '0 3px 10px rgba(253, 203, 110, 0.25)' : 'none'
                                                    }}
                                                >
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge 
                                                                    bg={addr.type === 'home' ? 'primary' : addr.type === 'office' ? 'warning' : 'info'}
                                                                    className="text-uppercase px-2 py-1"
                                                                    style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                                                                >
                                                                    {addr.type === 'home' ? '🏠 Home' : addr.type === 'office' ? '🏢 Office' : '📍 Other'}
                                                                </Badge>
                                                                {addr.isDefault && (
                                                                    <Badge bg="success" className="px-2 py-1" style={{ fontSize: '11px' }}>
                                                                        ★ Default
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {!addr.isDefault && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0 text-decoration-none text-muted"
                                                                    style={{ fontSize: '11px' }}
                                                                    onClick={() => handleSetDefault(addr._id)}
                                                                >
                                                                    Set Default
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="account-address-box">
                                                            {addr.fullName && (
                                                                <h6 className="mb-2 fw-bold text-dark">{addr.fullName}</h6>
                                                            )}
                                                            <div className="text-muted small mb-1">
                                                                {addr.street}
                                                            </div>
                                                            <div className="text-muted small mb-1">
                                                                {addr.city}, {addr.state} - {addr.zipCode}
                                                            </div>
                                                            <div className="text-muted small mb-2">
                                                                {addr.country || 'India'}
                                                            </div>
                                                            {addr.phone && (
                                                                <div className="text-dark small fw-semibold">
                                                                    📞 {addr.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="account-address-bottom mt-3 pt-3 border-top d-flex justify-content-end gap-3">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-link p-0 text-primary text-decoration-none small"
                                                            onClick={() => handleOpenEditModal(addr)}
                                                        >
                                                            <i className="fa-solid fa-pen me-1" />Edit
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-link p-0 text-danger text-decoration-none small"
                                                            onClick={() => handleDelete(addr._id)}
                                                        >
                                                            <i className="fa-solid fa-trash-can me-1" />Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Address Card */}
                                        <div className="col-md-6 m-b30">
                                            <div 
                                                className="account-card-add h-100 p-4 bg-white rounded border d-flex flex-column align-items-center justify-content-center text-center cursor-pointer"
                                                style={{ borderStyle: 'dashed', cursor: 'pointer', minHeight: '220px' }}
                                                onClick={handleOpenAddModal}
                                            >
                                                <div className="mb-2 text-primary" style={{ fontSize: '2rem' }}>
                                                    <i className="fa-solid fa-circle-plus" />
                                                </div>
                                                <h5 className="mb-1 fw-bold">Add Another Address</h5>
                                                <p className="text-muted small mb-3">Add multiple delivery locations for office, home, etc.</p>
                                                <button className="btn btn-outline-secondary btn-sm px-4">Add Address</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Add / Edit Address */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5 fw-bold">
                            {editingId ? "Edit Address" : "Add New Address"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row g-3">
                            <div className="col-12">
                                <Form.Label className="small fw-bold d-block mb-2">Address Type</Form.Label>
                                <div className="d-flex gap-2">
                                    {(['home', 'office', 'other'] as const).map(type => {
                                        const isSelected = formData.type === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 ${
                                                    isSelected 
                                                        ? 'btn-primary text-white shadow-sm' 
                                                        : 'btn-outline-secondary bg-white text-dark'
                                                }`}
                                                style={{
                                                    borderRadius: '8px',
                                                    fontWeight: isSelected ? 600 : 500,
                                                    transition: 'all 0.15s ease-in-out',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setFormData(prev => ({ ...prev, type }))}
                                            >
                                                <span>
                                                    {type === 'home' ? '🏠' : type === 'office' ? '🏢' : '📍'}
                                                </span>
                                                <span className="text-capitalize">
                                                    {type}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">Recipient Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    placeholder="e.g. John Doe"
                                    value={formData.fullName || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">Contact Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-12">
                                <Form.Label className="small fw-bold">Street Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="street"
                                    placeholder="House/Flat number, Street, Landmark"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">City <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">State <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">ZIP / Postal Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="zipCode"
                                    placeholder="e.g. 110001"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label className="small fw-bold">Country</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="country"
                                    value={formData.country || 'India'}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-12">
                                <Form.Check
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    label="Set as my default shipping address"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseModal} disabled={saving}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Saving...
                                </>
                            ) : (
                                editingId ? "Update Address" : "Save Address"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </CommanLayout>
    );
}