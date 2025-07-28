# Dashboard2 Component Documentation

## Overview
The Dashboard2 component is a comprehensive analytics dashboard that displays various metrics and visualizations related to applications, transactions, and products in the logistics system.

## Data Sources

### 1. Applications Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/application/`
- **Data Retrieved**: 
  - Active applications (`status=active`)
  - Completed applications (`status=completed`)
  - Includes information about brutto, netto weights, and firm details
  - Pagination supported for large datasets

### 2. Transactions Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/transactions/`
- **Purpose**: Tracks product movements and quantities
- **Related Data**: Links to applications through `application_id`

### 3. Payments Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/application/pay/`
- **Purpose**: Tracks financial transactions
- **Filtered**: Only for completed applications

### 4. Products Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/items/product/`
- **Purpose**: Master list of all products in the system

### 5. Transport Types Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/transport/type/`
- **Purpose**: Information about different transport types used

### 6. Firms Data
- **Endpoint**: `https://cargo-calc.uz/api/v1/firms/firm/`
- **Search Feature**: Supports searching firms by name
- **Details**: Includes firm name and INN (tax identification number)

## Key Features

### 1. Statistics Display
- Total Applications Count
- Active Applications Count
- Completed Applications Count
- Total Revenue
- Total Brutto Weight
- Total Netto Weight

### 2. Filtering Capabilities
- By Date Range (dateFrom, dateTo)
- By Firm
- By Product

### 3. Visualizations
1. **Application Status Chart**
   - Shows distribution of active vs completed applications
   - Uses PieChart component

2. **Product Distribution Chart**
   - Shows top 15 products by quantity
   - Interactive legend with scroll functionality
   - Percentage distribution visualization

3. **Product Table**
   - Paginated display of products
   - Shows product name, quantity, number of applications
   - Sortable by name or quantity

### 4. Real-time Updates
- Data refreshes when:
  - Date range changes
  - Firm selection changes
  - Product selection changes

## State Management

### Primary State Variables
1. `applications`: Stores all application data
2. `transactions`: Stores transaction history
3. `payments`: Stores payment information
4. `products`: Stores product catalog
5. `selectedFirm`: Currently selected firm
6. `dateFrom` & `dateTo`: Date range filters

### Computed Values
1. `applicationStats`: Calculates statistics based on applications
2. `totalRevenue`: Computed from payments data
3. `totalBrutto` & `totalNetto`: Calculated from application weights
4. `firmProductData`: Processes product distribution data

## Performance Considerations

1. **Pagination**
   - Product table uses client-side pagination
   - API calls support server-side pagination

2. **Data Caching**
   - Memoized calculations using useMemo
   - Prevents unnecessary re-renders

3. **Loading States**
   - Loading indicator during data fetching
   - Skeleton loading for better UX

## Error Handling
- Console logging for API errors
- Error state management for failed requests
- Graceful degradation of features when data is unavailable

## Internationalization
- Uses i18n for translations
- Supports multiple languages through translation files
- Format numbers according to locale
