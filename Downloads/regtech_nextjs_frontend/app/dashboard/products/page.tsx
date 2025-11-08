"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useLanguageContext } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"

export default function ProductsPage() {
  const { hasPermission } = useAuth()
  const { t } = useLanguageContext()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await apiClient("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await apiClient(`/api/products/${productId}`, {
        method: "DELETE",
      })
      setProducts(products.filter((p) => p.id !== productId))
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("products.title")}</h1>
          <p className="text-slate-600 mt-1">{t("products.subtitle")}</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t("products.addProduct")}
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("products.productCatalog")}</CardTitle>
          <CardDescription>{t("products.allRegisteredProducts")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t("products.loadingProducts")}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("products.noProductsFound")}</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">{t("products.getStartedByAdding")}</p>
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("products.addYourFirstProduct")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {t("products.productName")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {t("products.productType")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {t("products.classification")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {t("products.regulatoryPathway")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">{t("products.status")}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {t("products.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        <Link href={`/dashboard/products/${product.id}`} className="hover:text-blue-600">
                          {product.product_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.product_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.product_classification || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.regulatory_pathway || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        {hasPermission("manage_products") && (
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        {hasPermission("manage_products") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
