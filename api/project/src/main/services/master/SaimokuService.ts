import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { SaimokuSearchRequest } from "@common/model/master/SaimokuSearchRequest";
import { SaimokuSearchResponse } from "@common/model/master/SaimokuSearchResponse";
import { selectSaimokuDetail as getSelectSaimokuDetailSql } from "@services/master/selectSaimokuDetail.sql";
import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";
import {
  EntitySearchCondition,
  EntitySearchType,
  Order,
} from "@common/model/Entity";

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

  /**
   * 対象年度の一覧を取得する
   * @returns
   */
  public async selectNendoList() {
    const searchCondition: EntitySearchCondition<NendoMasterEntity> = {
      orderBy: [["nendo", Order.Desc]],
    };
    return await this.selectByEntity(NendoMasterEntity, searchCondition);
  }
}
