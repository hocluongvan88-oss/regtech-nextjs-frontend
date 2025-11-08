"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface ImpactAssessmentFormProps {
  regulatoryIntelligenceId: string
  onSubmit: (data: any) => void
}

export function ImpactAssessmentForm({ regulatoryIntelligenceId, onSubmit }: ImpactAssessmentFormProps) {
  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split("T")[0],
    labeling_impact_required: false,
    labeling_update_hours: 0,
    quality_impact_required: false,
    qms_update_hours: 0,
    manufacturing_impact_required: false,
    manufacturing_change_hours: 0,
    training_required: false,
    training_estimated_hours: 0,
    total_estimated_hours: 0,
    estimated_cost_usd: 0,
    implementation_risk: "medium",
    compliance_risk_if_not_implemented: "high",
  })

  const handleCheckboxChange = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof formData],
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotalHours = () => {
    const total =
      (formData.labeling_update_hours || 0) +
      (formData.qms_update_hours || 0) +
      (formData.manufacturing_change_hours || 0) +
      (formData.training_estimated_hours || 0)
    handleInputChange("total_estimated_hours", total)
  }

  const handleSubmit = async () => {
    calculateTotalHours()
    onSubmit({
      ...formData,
      regulatory_intelligence_id: regulatoryIntelligenceId,
      action: "create",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Impact Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labeling Impact */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="labeling"
              checked={formData.labeling_impact_required}
              onCheckedChange={() => handleCheckboxChange("labeling_impact_required")}
            />
            <Label htmlFor="labeling" className="font-medium">
              Labeling Update Required
            </Label>
          </div>
          {formData.labeling_impact_required && (
            <Input
              type="number"
              placeholder="Estimated hours"
              value={formData.labeling_update_hours}
              onChange={(e) => handleInputChange("labeling_update_hours", Number(e.target.value))}
              className="ml-6"
            />
          )}
        </div>

        {/* Quality/QMS Impact */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="quality"
              checked={formData.quality_impact_required}
              onCheckedChange={() => handleCheckboxChange("quality_impact_required")}
            />
            <Label htmlFor="quality" className="font-medium">
              Quality Management System Update Required
            </Label>
          </div>
          {formData.quality_impact_required && (
            <Input
              type="number"
              placeholder="Estimated hours"
              value={formData.qms_update_hours}
              onChange={(e) => handleInputChange("qms_update_hours", Number(e.target.value))}
              className="ml-6"
            />
          )}
        </div>

        {/* Manufacturing Impact */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="manufacturing"
              checked={formData.manufacturing_impact_required}
              onCheckedChange={() => handleCheckboxChange("manufacturing_impact_required")}
            />
            <Label htmlFor="manufacturing" className="font-medium">
              Manufacturing Change Required
            </Label>
          </div>
          {formData.manufacturing_impact_required && (
            <Input
              type="number"
              placeholder="Estimated hours"
              value={formData.manufacturing_change_hours}
              onChange={(e) => handleInputChange("manufacturing_change_hours", Number(e.target.value))}
              className="ml-6"
            />
          )}
        </div>

        {/* Training */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="training"
              checked={formData.training_required}
              onCheckedChange={() => handleCheckboxChange("training_required")}
            />
            <Label htmlFor="training" className="font-medium">
              Training Required
            </Label>
          </div>
          {formData.training_required && (
            <Input
              type="number"
              placeholder="Estimated hours"
              value={formData.training_estimated_hours}
              onChange={(e) => handleInputChange("training_estimated_hours", Number(e.target.value))}
              className="ml-6"
            />
          )}
        </div>

        {/* Cost Estimate */}
        <div>
          <Label className="font-medium">Estimated Cost (USD)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.estimated_cost_usd}
            onChange={(e) => handleInputChange("estimated_cost_usd", Number(e.target.value))}
            className="mt-2"
          />
        </div>

        {/* Risk Assessment */}
        <div>
          <Label className="font-medium">Implementation Risk</Label>
          <select
            value={formData.implementation_risk}
            onChange={(e) => handleInputChange("implementation_risk", e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Create Impact Assessment
        </Button>
      </CardContent>
    </Card>
  )
}
