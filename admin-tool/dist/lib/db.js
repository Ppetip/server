"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSystem = exports.updateAdminConfig = exports.getAdminConfig = exports.getStats = void 0;
const supabase_1 = require("./supabase");
const getStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const { count, error } = yield supabase_1.supabase
        .from("submissions")
        .select("*", { count: "exact", head: true });
    if (error)
        throw error;
    const config = yield (0, exports.getAdminConfig)();
    const realCount = count || 0;
    const fibbedCount = realCount + (config.countOffset || 0);
    return {
        realCount,
        fibbedCount,
        config
    };
});
exports.getStats = getStats;
const getAdminConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from("admin_config")
        .select("value")
        .eq("key", "main")
        .single();
    if (error || !data) {
        return { donationGoal: 20000, donationCurrent: 0, donationLink: "", countOffset: 0 };
    }
    const defaults = { donationGoal: 20000, donationCurrent: 0, donationLink: "", countOffset: 0 };
    return Object.assign(Object.assign({}, defaults), data.value);
});
exports.getAdminConfig = getAdminConfig;
const updateAdminConfig = (newConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const current = yield (0, exports.getAdminConfig)();
    const updated = Object.assign(Object.assign({}, current), newConfig);
    const { error } = yield supabase_1.supabase
        .from("admin_config")
        .upsert({ key: "main", value: updated });
    if (error)
        throw error;
    return true;
});
exports.updateAdminConfig = updateAdminConfig;
const resetSystem = () => __awaiter(void 0, void 0, void 0, function* () {
    // Delete all submissions except ID 0 (if any special logic existed, but we delete all non-0)
    const { error } = yield supabase_1.supabase.from("submissions").delete().neq("id", 0);
    if (error)
        throw error;
    // Reset offset? Maybe, maybe not. Let's ask user or keep it.
    // For now, let's keep the offset unless explicitly reset.
    // await updateAdminConfig({ countOffset: 0 }); 
    return true;
});
exports.resetSystem = resetSystem;
