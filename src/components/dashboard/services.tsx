import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Search, Loader2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getStoredAuthData, API_BASE_URL } from "@/lib/utils"
import { Select } from "@/components/ui/select"

interface Service {
  _id: string
  serviceName: string
  description: string
  price: number
  duration: number
  active: boolean
  unit: 'piece' | 'pair' | 'packet'
  dropdownOptions: {
    title: string
    options: string[]
  }
  imageURL: {
    url: string
    cloudinaryId: string
  }
  createdAt: string
  updatedAt: string
}

interface CreateServiceData {
  name: string
  description: string
  price: number | ""
  duration: number | ""
  isActive: boolean
  category: string
  features: string[]
}

interface ValidationErrors {
  serviceName?: string
  description?: string
  price?: string
  duration?: string
  dropdownOptions?: string
}

function CreateServiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<CreateServiceData>({
    name: "",
    description: "",
    price: "" as unknown as number,
    duration: "" as unknown as number,
    isActive: true,
    category: "Course",
    features: []
  })
  const [featureInput, setFeatureInput] = useState("")

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Service Name validation
    if (!formData.name.trim()) {
      errors.serviceName = "Service name is required"
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters"
    }

    // Price validation
    if (formData.price === "") {
      errors.price = "Price is required"
    } else if (Number(formData.price) < 0) {
      errors.price = "Price cannot be negative"
    }

    // Duration validation
    if (formData.duration === "") {
      errors.duration = "Duration is required"
    } else if (Number(formData.duration) < 1) {
      errors.duration = "Duration must be at least 1"
    }

    // Features validation
    if (formData.features.length === 0) {
      errors.dropdownOptions = "At least one feature is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setValidationErrors({})

    try {
      const { tokens } = getStoredAuthData()
      
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      // Ensure price and duration are numbers before sending
      const dataToSend = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      }

      console.log('Sending data:', dataToSend)

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        if (data.errors) {
          const serverErrors: ValidationErrors = {}
          data.errors.forEach((error: any) => {
            console.log('Validation error:', error)
            const field = error.path
            serverErrors[field as keyof ValidationErrors] = error.message
          })
          setValidationErrors(serverErrors)
          setError('Please fix the validation errors below.')
          return
        }
        throw new Error(data.message || 'Failed to create service')
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error details:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }))
      setFeatureInput("")
      setValidationErrors(prev => ({ ...prev, dropdownOptions: undefined }))
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 bg-white">Create New Service</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white">
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                setValidationErrors(prev => ({ ...prev, serviceName: undefined }))
              }}
              required
              className={`bg-white ${validationErrors.serviceName ? 'border-red-500' : ''}`}
            />
            {validationErrors.serviceName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.serviceName}</p>
            )}
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                setValidationErrors(prev => ({ ...prev, description: undefined }))
              }}
              required
              className={`bg-white ${validationErrors.description ? 'border-red-500' : ''}`}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <Input
              type="number"
              value={formData.price || ""}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : "" as unknown as number }))
                setValidationErrors(prev => ({ ...prev, price: undefined }))
              }}
              required
              className={`bg-white ${validationErrors.price ? 'border-red-500' : ''}`}
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium mb-1">Duration (days)</label>
            <Input
              type="number"
              value={formData.duration || ""}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, duration: e.target.value ? Number(e.target.value) : "" as unknown as number }))
                setValidationErrors(prev => ({ ...prev, duration: undefined }))
              }}
              required
              className={`bg-white ${validationErrors.duration ? 'border-red-500' : ''}`}
            />
            {validationErrors.duration && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
            )}
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium mb-1">Features</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
                className={`bg-white ${validationErrors.dropdownOptions ? 'border-red-500' : ''}`}
              />
              <Button 
                type="button" 
                onClick={addFeature} 
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                Add
              </Button>
            </div>
            {validationErrors.dropdownOptions && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.dropdownOptions}</p>
            )}
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 bg-white">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ service, onClose, onConfirm }: { service: Service; onClose: () => void; onConfirm: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { tokens } = getStoredAuthData()
      
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/services/${service._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      onConfirm()
    } catch (error) {
      console.error('Error deleting service:', error)
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Delete Service</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{service.serviceName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Service'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { tokens } = getStoredAuthData()
      
      if (!tokens?.accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${API_BASE_URL}/services?category=Course&isActive=true`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch services')
      }

      if (data.success) {
        setServices(data.data)
      } else {
        throw new Error('Failed to fetch services')
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const filteredServices = services?.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleDeleteService = () => {
    fetchServices() // Refresh the list after deletion
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Services</h1>
        <p className="text-gray-500">Manage and organize your service catalog</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 ml-4"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Service
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <Card key={service._id} className="flex flex-col h-[300px]">
              <div className="p-4 border-b border-gray-100 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-lg truncate pr-4">{service.serviceName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 h-[50px]">
                  {service.description}
                </p>
              </div>
              <div className="px-4 pt-4 pb-5 bg-gray-50">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration: </span>
                    <span className="font-medium">{service.duration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-gray-500">Features: </span>
                    <span className="font-medium line-clamp-1">
                      {service.dropdownOptions.options.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateServiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchServices()
            setShowCreateModal(false)
          }}
        />
      )}

      {serviceToDelete && (
        <DeleteConfirmModal
          service={serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          onConfirm={handleDeleteService}
        />
      )}
    </div>
  )
} 