import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { MapPin, Package, Building, Search, Warehouse as WarehouseIcon } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorState from "@/components/errors/ErrorState";
import EmptyState from "@/components/errors/EmptyState";

const WarehouseDetails = ({ user }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWarehouseDetail = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const userID = user._id;
      const { data } = await api.get(`/api/warehouse/info`, {
        params: { userID: userID },
      });

      setWarehouses(data.warehouseDetails || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <ErrorState error={error} onRetry={fetchWarehouseDetail} className="min-h-screen justify-center" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
      {/* Header */}
      <Card className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <WarehouseIcon size={19} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Warehouses</h1>
          <p className="text-xs text-muted-foreground">
            {warehouses.length} warehouse{warehouses.length === 1 ? "" : "s"} tracked
          </p>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search warehouses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm pl-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filteredWarehouses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWarehouses.map((warehouse) => (
            <Card
              key={warehouse._id}
              className="cursor-pointer p-4 transition-shadow hover:shadow-md"
              onClick={() => setSelectedWarehouse(warehouse)}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">{warehouse.name}</h3>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={11} /> {warehouse.location.city}
                </span>
              </div>

              <Progress value={warehouse.perUsed || 0} className="h-1.5" />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{warehouse.perUsed || 0}% utilized</span>
                <span className="font-mono">{warehouse.totalCapacity} sq ft</span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                <Package size={12} />
                {warehouse.items?.length || 0} item{warehouse.items?.length === 1 ? "" : "s"} stored
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={WarehouseIcon}
          title={searchTerm ? "No warehouses found" : "No warehouses yet"}
          message={searchTerm ? "Try a different search term." : "Add a warehouse from your profile to see it here."}
        />
      )}

      {/* Detail modal */}
      <Dialog open={!!selectedWarehouse} onOpenChange={(open) => !open && setSelectedWarehouse(null)}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          {selectedWarehouse && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWarehouse.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <h3 className="text-sm font-semibold">Location</h3>
                  </div>
                  <div className="rounded-md bg-accent/50 p-3 text-sm text-muted-foreground">
                    <p>{selectedWarehouse.location.line1}</p>
                    {selectedWarehouse.location.line2 && <p>{selectedWarehouse.location.line2}</p>}
                    <p>
                      {selectedWarehouse.location.city}, {selectedWarehouse.location.state}
                    </p>
                    <p>
                      {selectedWarehouse.location.country} — {selectedWarehouse.location.pincode}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Building size={14} className="text-primary" />
                    <h3 className="text-sm font-semibold">Capacity</h3>
                  </div>
                  <div className="rounded-md bg-accent/50 p-3 text-sm">
                    <div className="mb-2 flex justify-between">
                      <span className="text-muted-foreground">Total capacity</span>
                      <span className="font-mono font-medium">{selectedWarehouse.totalCapacity} sq ft</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-muted-foreground">Utilized</span>
                      <span className="font-mono font-medium">{selectedWarehouse.perUsed}%</span>
                    </div>
                    <Progress value={selectedWarehouse.perUsed} className="mt-1 h-1.5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Package size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold">Items</h3>
                </div>
                {selectedWarehouse.items && selectedWarehouse.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 font-medium">Item name</th>
                        <th className="pb-2 text-right font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWarehouse.items.map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right font-mono">{item.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this warehouse</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseDetails;
