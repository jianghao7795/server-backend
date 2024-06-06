import service from "@/utils/request";
// @Tags SysDictionaryDetail
// @Summary 创建SysDictionaryDetail
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysDictionaryDetail true "创建SysDictionaryDetail"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /sysDictionaryDetail/createSysDictionaryDetail [post]
export const createSysDictionaryDetail = (data) => {
  return service({
    url: "/sysDictionaryDetail/createSysDictionaryDetail",
    method: "post",
    data,
  });
};

// @Tags SysDictionaryDetail
// @Summary 删除SysDictionaryDetail
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysDictionaryDetail true "删除SysDictionaryDetail"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /sysDictionaryDetail/deleteSysDictionaryDetail [delete]
export const deleteSysDictionaryDetail = (params) => {
  return service({
    url: `/sysDictionaryDetail/deleteSysDictionaryDetail/${params.ID}`,
    method: "delete",
  });
};

// @Tags SysDictionaryDetail
// @Summary 更新SysDictionaryDetail
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysDictionaryDetail true "更新SysDictionaryDetail"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /sysDictionaryDetail/updateSysDictionaryDetail [put]
export const updateSysDictionaryDetail = (data) => {
  return service({
    url: `/sysDictionaryDetail/updateSysDictionaryDetail/${data.ID}`,
    method: "put",
    data,
  });
};

// @Tags SysDictionaryDetail
// @Summary 用id查询SysDictionaryDetail
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysDictionaryDetail true "用id查询SysDictionaryDetail"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /sysDictionaryDetail/findSysDictionaryDetail [get]
export const findSysDictionaryDetail = (params) => {
  return service({
    url: `/sysDictionaryDetail/findSysDictionaryDetail/${params.ID}`,
    method: "get",
  });
};

// @Tags SysDictionaryDetail
// @Summary 分页获取SysDictionaryDetail列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.PageInfo true "分页获取SysDictionaryDetail列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /sysDictionaryDetail/getSysDictionaryDetailList [get]
export const getSysDictionaryDetailList = (params) => {
  return service({
    url: "/sysDictionaryDetail/getSysDictionaryDetailList",
    method: "get",
    params,
  });
};
