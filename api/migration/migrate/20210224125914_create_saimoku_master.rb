# 細目マスタ
class CreateSaimokuMaster < ActiveRecord::Migration[5.0]
  def change
    create_table :saimoku_masters do |t|
      # 細目コード
      t.string :saimoku_cd, limit: 5, null: false
      # 科目コード
      t.string :kamoku_cd, limit: 5, null: false
      # 細目フル名称
      t.text :saimoku_full_name, null: false
      # 細目略名称(一覧表示用)
      t.text :saimoku_ryaku_name, null: false
      # 細目カナ名称(科目検索用)
      t.text :saimoku_kana_name, null: false
    end
  end
end
