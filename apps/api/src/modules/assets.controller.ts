import { Controller, Get, Query } from "@nestjs/common";
import { getEnterpriseAssetPlan, searchAssets, type AssetCategory } from "@akdia/asset-library";

@Controller("assets")
export class AssetsController {
  @Get()
  search(@Query("q") q = "", @Query("category") category?: AssetCategory) {
    return searchAssets(q, category);
  }

  @Get("scale-plan")
  scalePlan() {
    return getEnterpriseAssetPlan();
  }
}
