import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { SaimokuSearchRequest } from "@common/model/master/SaimokuSearchRequest";
import { SaimokuSearchResponse } from "@common/model/master/SaimokuSearchResponse";
import { selectSaimokuDetail as getSelectSaimokuDetailSql } from "@services/master/selectSaimokuDetail.sql";

export class SaimokuService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider
  ) {
    super();
  }

  /**
   * 細目の詳細情報を関連情報とともに取得する
   * @param condition 検索条件
   */
  public async selectSaimokuDetail(condition: SaimokuSearchRequest) {
    return await this.select(
      SaimokuSearchResponse,
      getSelectSaimokuDetailSql(condition)
    );
  }
}
