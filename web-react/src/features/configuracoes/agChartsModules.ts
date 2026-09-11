import {ModuleRegistry, LicenseManager} from 'ag-charts-enterprise';

// LicenseManager.setLicenseKey('USING_AG_CHARTS_DEVELOPER_LICENSE');

import {
    CartesianChartModule,
    PolarChartModule,
    BarSeriesModule,
    LineSeriesModule,
    PieSeriesModule,
    DonutSeriesModule,
    CategoryAxisModule,
    NumberAxisModule,
    LegendModule,
    CrosshairModule,
    NavigatorModule,
    AnimationModule,
    AnnotationsModule,
    OrganizationSeriesModule,
} from 'ag-charts-enterprise';

ModuleRegistry.registerModules([
    CartesianChartModule,
    PolarChartModule,
    BarSeriesModule,
    LineSeriesModule,
    PieSeriesModule,
    DonutSeriesModule,
    CategoryAxisModule,
    NumberAxisModule,
    LegendModule,
    CrosshairModule,
    NavigatorModule,
    AnimationModule,
    AnnotationsModule,
    OrganizationSeriesModule,
]);