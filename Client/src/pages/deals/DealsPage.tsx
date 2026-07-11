import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, TrendingUp, Users, Calendar, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface DealItem {
  id: string;
  startup: {
    name: string;
    logo: string;
    industry: string;
  };
  amount: string;
  equity: string;
  status: 'Due Diligence' | 'Term Sheet' | 'Negotiation' | 'Closed' | 'Passed';
  stage: string;
  lastActivity: string;
}

export const DealsPage: React.FC = () => {
  const { backendUrl } = useAuth();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  
  // Add Deal Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    startupName: '',
    industry: '',
    amount: '',
    equity: '',
    stage: 'Seed',
    status: 'Due Diligence' as const
  });

  const statuses: ('Due Diligence' | 'Term Sheet' | 'Negotiation' | 'Closed' | 'Passed')[] = [
    'Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'
  ];

  const fetchDeals = () => {
    if (!backendUrl) return;
    axios.get(`${backendUrl}/api/deal`)
      .then(res => {
        if (res.data.success) {
          setDeals(res.data.deals);
        }
      })
      .catch(err => {
        console.error("Error loading deals:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, [backendUrl]);

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Due Diligence':
        return 'primary';
      case 'Term Sheet':
        return 'secondary';
      case 'Negotiation':
        return 'accent';
      case 'Closed':
        return 'success';
      case 'Passed':
        return 'error';
      default:
        return 'gray';
    }
  };

  // Status changer API
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/deal/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setDeals(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as any, lastActivity: new Date().toISOString() } : d));
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    }
  };

  // Delete Deal API
  const handleDeleteDeal = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      if (!backendUrl) return;
      const res = await axios.delete(`${backendUrl}/api/deal/${id}`);
      if (res.data.success) {
        toast.success("Deal deleted successfully");
        setDeals(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error("Delete deal error:", err);
      toast.error("Failed to delete deal");
    }
  };

  // Add Deal Submit API
  const handleAddDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.startupName || !newDeal.industry || !newDeal.amount || !newDeal.equity) {
      toast.error("Please fill in all fields");
      return;
    }

    const toastId = toast.loading("Adding deal to pipeline...");
    try {
      if (!backendUrl) return;
      const res = await axios.post(`${backendUrl}/api/deal`, newDeal);
      if (res.data.success) {
        toast.success("Deal added successfully", { id: toastId });
        setShowAddModal(false);
        setNewDeal({
          startupName: '',
          industry: '',
          amount: '',
          equity: '',
          stage: 'Seed',
          status: 'Due Diligence'
        });
        fetchDeals();
      }
    } catch (err) {
      console.error("Error creating deal:", err);
      toast.error("Failed to create deal", { id: toastId });
    }
  };

  // Dynamic Pipeline metrics calculator
  const parseAmount = (amtStr: string): number => {
    const clean = amtStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    if (amtStr.toUpperCase().includes('M')) {
      return num;
    } else if (amtStr.toUpperCase().includes('K')) {
      return num / 1000;
    }
    return num;
  };

  const totalInvestmentSum = deals.reduce((acc, d) => acc + parseAmount(d.amount), 0);
  const activeDealsCount = deals.filter(d => ['Due Diligence', 'Term Sheet', 'Negotiation'].includes(d.status)).length;
  const portfolioCompaniesCount = deals.filter(d => d.status === 'Closed').length;
  
  // Deals closed this current month
  const closedThisMonthCount = deals.filter(d => {
    if (d.status !== 'Closed') return false;
    const dealDate = new Date(d.lastActivity);
    const today = new Date();
    return dealDate.getMonth() === today.getMonth() && dealDate.getFullYear() === today.getFullYear();
  }).length;

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = searchQuery === '' || 
      deal.startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.startup.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus.length === 0 ||
      selectedStatus.includes(deal.status);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-600">Track and manage your investment pipeline dynamically</p>
        </div>
        
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          Add Deal
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-3">
                <DollarSign size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-lg font-semibold text-gray-900">${totalInvestmentSum.toFixed(1)}M</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg mr-3">
                <TrendingUp size={20} className="text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-lg font-semibold text-gray-900">{activeDealsCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg mr-3">
                <Users size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Portfolio Companies</p>
                <p className="text-lg font-semibold text-gray-900">{portfolioCompaniesCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg mr-3">
                <Calendar size={20} className="text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Closed This Month</p>
                <p className="text-lg font-semibold text-gray-900">{closedThisMonthCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search deals by startup name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <div className="w-full md:w-1/3 flex items-center gap-2">
          <Filter size={18} className="text-gray-500 flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <Badge
                key={status}
                variant={selectedStatus.includes(status) ? getStatusColor(status) : 'gray'}
                className="cursor-pointer"
                onClick={() => toggleStatusFilter(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Deals table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Active Deals</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equity
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(deal => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={deal.startup.logo}
                            alt={deal.startup.name}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {deal.startup.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deal.startup.industry}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{deal.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{deal.equity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deal.status}
                          onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:ring-1 focus:ring-primary-500 bg-opacity-10 bg-gray-100 cursor-pointer text-${getStatusColor(deal.status)}-700`}
                          style={{
                            backgroundColor: `var(--color-${getStatusColor(deal.status)}-100, rgba(229, 231, 235, 0.4))`
                          }}
                        >
                          {statuses.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{deal.stage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(deal.lastActivity).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                          onClick={() => handleDeleteDeal(deal.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No deals found in pipeline. Click "Add Deal" to populate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Deal to Pipeline</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
                <Input
                  placeholder="e.g. InnovateX"
                  value={newDeal.startupName}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, startupName: e.target.value }))}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <Input
                  placeholder="e.g. AI, HealthTech"
                  value={newDeal.industry}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, industry: e.target.value }))}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Needed</label>
                  <Input
                    placeholder="e.g. $1.5M, $500K"
                    value={newDeal.amount}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, amount: e.target.value }))}
                    fullWidth
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equity Offered</label>
                  <Input
                    placeholder="e.g. 10%, 15%"
                    value={newDeal.equity}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, equity: e.target.value }))}
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, stage: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Status</label>
                  <select
                    value={newDeal.status}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save to Pipeline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};