"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

interface FacilityForm {
  facility_name: string
  facility_type: string
  street_address: string
  city: string
  state_province: string
  postal_code: string
  country: string
  fei_number: string
  duns_number: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
}

export default function NewFacilityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FacilityForm>({
    facility_name: "",
    facility_type: "drug",
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "US",
    fei_number: "",
    duns_number: "",
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.facility_name) {
      alert("Facility name is required")
      return
    }

    if (!user?.clientId) {
      alert("User client ID not found. Please log in again.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          client_id: user.clientId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create facility")
      }

      const data = await response.json()
      router.push(`/dashboard/facilities`)
    } catch (error) {
      console.error("[v0] Error creating facility:", error)
      alert(error instanceof Error ? error.message : "Error creating facility")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Facility</h1>
          <p className="text-slate-600 mt-1">Register a new FDA facility</p>
        </div>
        <Link href="/dashboard/facilities">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facility Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Facility Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Facility Name *</label>
              <input
                type="text"
                value={form.facility_name}
                onChange={(e) => setForm({ ...form, facility_name: e.target.value })}
                placeholder="Enter facility name"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            {/* Facility Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Facility Type</label>
              <select
                value={form.facility_type}
                onChange={(e) => setForm({ ...form, facility_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="drug">Drug</option>
                <option value="device">Device</option>
                <option value="food">Food</option>
                <option value="cosmetic">Cosmetic</option>
              </select>
            </div>

            {/* FEI Number */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">FEI Number</label>
              <input
                type="text"
                value={form.fei_number}
                onChange={(e) => setForm({ ...form, fei_number: e.target.value })}
                placeholder="FDA Establishment Identifier"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* DUNS Number */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">DUNS Number</label>
              <input
                type="text"
                value={form.duns_number}
                onChange={(e) => setForm({ ...form, duns_number: e.target.value })}
                placeholder="Data Universal Numbering System"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-900 mb-2">Street Address</label>
                <input
                  type="text"
                  value={form.street_address}
                  onChange={(e) => setForm({ ...form, street_address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">State/Province</label>
                <input
                  type="text"
                  value={form.state_province}
                  onChange={(e) => setForm({ ...form, state_province: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-4">Primary Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={form.primary_contact_name}
                    onChange={(e) => setForm({ ...form, primary_contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.primary_contact_email}
                    onChange={(e) => setForm({ ...form, primary_contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={form.primary_contact_phone}
                    onChange={(e) => setForm({ ...form, primary_contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href="/dashboard/facilities">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Facility"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
