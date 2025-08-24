"use client";

import React, { useState, useEffect, useRef } from "react";
import { useInfoGatheringFlow } from "@/hooks/inforGath";
import { Button } from "@/components/Button/Button";
import { Question } from "./question";

interface InfoGatheringFormProps {
  onComplete?: (result: any) => void;
}

export const InfoGatheringForm: React.FC<InfoGatheringFormProps> = ({
  onComplete,
}) => {
  const [prompt, setPrompt] = useState("");
  const hasGeneratedFinal = useRef(false);
  
  const {
    currentPhase,
    analysis,
    quality,
    finalOutput,
    isAnalyzing,
    isAssessingQuality,
    isGeneratingFinal,
    isLoading,
    error,
    startAnalysis,
    assessQuality,
    generateFinalOutput,
    reset,
    clearError,
    questionnaire,
  } = useInfoGatheringFlow();

  // เพิ่ม useEffect เพื่อเรียก onComplete เมื่อ phase เป็น complete
  useEffect(() => {
    if (currentPhase === "complete" && finalOutput && onComplete) {
      onComplete(finalOutput);
    }
  }, [currentPhase, finalOutput, onComplete]);

  // เพิ่ม useEffect เพื่อเรียก generateFinalOutput อัตโนมัติเมื่อคะแนนคุณภาพ >= 70
  useEffect(() => {
    if (currentPhase === "final" && quality && quality.overallScore >= 70 && !finalOutput && !hasGeneratedFinal.current) {
      hasGeneratedFinal.current = true;
      generateFinalOutput();
    }
  }, [currentPhase, quality, finalOutput]);

  // Reset flag when phase changes
  useEffect(() => {
    if (currentPhase !== "final") {
      hasGeneratedFinal.current = false;
    }
  }, [currentPhase]);

 

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    await startAnalysis(prompt);
  };

  const handleAnswerQuestion = (questionId: string, answer: string | string[]) => {
    questionnaire.setAnswer(questionId, answer);
  };

  const handleNextQuestion = () => {
    if (
      questionnaire.currentQuestionIndex <
      questionnaire.questions.length - 1
    ) {
      questionnaire.nextQuestion();
    } else {
      // All questions answered, assess quality
      assessQuality();
    }
  };

  const handleGenerateFinal = async () => {
    await generateFinalOutput();
  };

  const handleReset = () => {
    reset();
    setPrompt("");
  };

  // Render different phases
  const renderInitialPhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">เริ่มต้นการสร้างเว็บไซต์</h2>
      <p className="text-gray-600">
        กรุณาอธิบายความต้องการของเว็บไซต์ที่คุณต้องการสร้าง
      </p>

      <form onSubmit={handleSubmitPrompt} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="เช่น ฉันต้องการเว็บไซต์ร้านค้าออนไลน์สำหรับขายเสื้อผ้า..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={4}
          disabled={isAnalyzing || isLoading}
        />

        <Button
          type="submit"
          disabled={!prompt.trim() || isAnalyzing || isLoading}
          className="w-full"
        >
          {isAnalyzing ? "กำลังวิเคราะห์..." : "เริ่มวิเคราะห์"}
        </Button>
      </form>
    </div>
  );

  const renderQuestionsPhase = () => {
    const currentQuestion = questionnaire.getCurrentQuestion();

    if (!currentQuestion) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">ไม่พบคำถาม</h3>
            <p className="text-yellow-700">กรุณาลองใหม่อีกครั้ง</p>
          </div>
        </div>
      );
    }

    return (
      <Question
        currentQuestion={currentQuestion}
        currentQuestionIndex={questionnaire.currentQuestionIndex}
        totalQuestions={questionnaire.questions.length}
        answers={questionnaire.answers}
        errors={questionnaire.errors}
        analysis={analysis}
        isLoading={isLoading}
        onAnswerQuestion={handleAnswerQuestion}
        onNextQuestion={handleNextQuestion}
        onPreviousQuestion={questionnaire.previousQuestion}
      />
    );
  };

  const renderQualityPhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">ประเมินคุณภาพข้อมูล</h2>

      {quality && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">ความครบถ้วน</h3>
              <p className="text-2xl font-bold text-blue-600">
                {quality.completeness}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">ความชัดเจน</h3>
              <p className="text-2xl font-bold text-green-600">
                {quality.clarity}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">ความสอดคล้อง</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {quality.consistency}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">คะแนนรวม</h3>
              <p className="text-2xl font-bold text-purple-600">
                {quality.overallScore}%
              </p>
            </div>
          </div>

          {quality.recommendations.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">ข้อเสนอแนะ:</h3>
              <ul className="list-disc list-inside space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleGenerateFinal}
            disabled={isGeneratingFinal || isLoading}
            className="w-full"
          >
            {isGeneratingFinal ? "กำลังสร้างผลลัพธ์..." : "สร้างผลลัพธ์สุดท้าย"}
          </Button>
        </div>
      )}
    </div>
  );

  const renderCompletePhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">เสร็จสิ้น!</h2>

      {finalOutput && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">สรุปผลลัพธ์</h3>
            <p className="text-green-700">
              เว็บไซต์ของคุณพร้อมแล้ว! เราได้สร้างเว็บไซต์ตามความต้องการของคุณ
            </p>
          </div>

          {finalOutput.json && (
            <div className="space-y-4">
              {/* ข้อมูลพื้นฐาน */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">ข้อมูลพื้นฐาน:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">ชื่อเว็บไซต์:</span>
                    <p className="text-gray-700">{finalOutput.json.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">ประเภท:</span>
                    <p className="text-gray-700">{finalOutput.json.type}</p>
                  </div>
                  <div>
                    <span className="font-medium">กลุ่มเป้าหมาย:</span>
                    <p className="text-gray-700">{finalOutput.json.targetAudience}</p>
                  </div>
                  <div>
                    <span className="font-medium">ระดับความซับซ้อน:</span>
                    <p className="text-gray-700">{finalOutput.json.complexity}</p>
                  </div>
                </div>
              </div>

              {/* การออกแบบ */}
              {finalOutput.json.design && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-purple-800">การออกแบบ:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">สไตล์การออกแบบ:</span>
                      <p className="text-purple-700">{finalOutput.json.design.designStyle || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">ฟอนต์ที่แนะนำ:</span>
                      <p className="text-purple-700">{finalOutput.json.design.typography || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">สีหลัก:</span>
                      <p className="text-purple-700">{finalOutput.json.design.primaryColors?.join(', ') || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">สีรอง:</span>
                      <p className="text-purple-700">{finalOutput.json.design.secondaryColors?.join(', ') || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">สไตล์ภาพ:</span>
                      <p className="text-purple-700">{finalOutput.json.design.visualStyle || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ฟีเจอร์ */}
              {finalOutput.json.features && finalOutput.json.functionality && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-800">ฟีเจอร์:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700">ฟีเจอร์หลัก:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {finalOutput.json.features.map((feature, index) => (
                          <li key={index} className="text-green-700 text-sm">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-700">ฟังก์ชันการทำงาน:</h4>
                      <ul className="space-y-1">
                        <li className="text-green-700 text-sm">
                          ระบบจัดการผู้ใช้: {finalOutput.json.functionality.userManagement ? '✓' : '✗'}
                        </li>
                        <li className="text-green-700 text-sm">
                          ระบบชำระเงิน: {finalOutput.json.functionality.payment ? '✓' : '✗'}
                        </li>
                        <li className="text-green-700 text-sm">
                          ระบบวิเคราะห์ข้อมูล: {finalOutput.json.functionality.analytics ? '✓' : '✗'}
                        </li>
                        <li className="text-green-700 text-sm">
                          SEO: {finalOutput.json.functionality.seo ? '✓' : '✗'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* เนื้อหา */}
              {finalOutput.json.content && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">เนื้อหา:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-700">หน้าเว็บ:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {finalOutput.json.content.pages?.map((page, index) => (
                          <li key={index} className="text-blue-700 text-sm">
                            {page}
                          </li>
                        )) || <li className="text-blue-700 text-sm">ไม่ระบุ</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700">ส่วนประกอบ:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {finalOutput.json.content.sections?.map((section, index) => (
                          <li key={index} className="text-blue-700 text-sm">
                            {section}
                          </li>
                        )) || <li className="text-blue-700 text-sm">ไม่ระบุ</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ข้อมูลเทคนิค */}
              {finalOutput.json.technical && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-orange-800">ข้อมูลเทคนิค:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Frontend:</span>
                      <p className="text-orange-700">{finalOutput.json.technical.frontend || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Backend:</span>
                      <p className="text-orange-700">{finalOutput.json.technical.backend || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">ฐานข้อมูล:</span>
                      <p className="text-orange-700">{finalOutput.json.technical.database || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="font-medium">การ Deploy:</span>
                      <p className="text-orange-700">{finalOutput.json.technical.deployment || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* สรุปและข้อเสนอแนะ */}
              {finalOutput.summary && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-800">ความต้องการ:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {finalOutput.summary.requirements.map((req, index) => (
                        <li key={index} className="text-yellow-700">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-indigo-800">ข้อเสนอแนะ:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {finalOutput.summary.recommendations.map((rec, index) => (
                        <li key={index} className="text-indigo-700">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">
                        เวลาที่ประมาณการ
                      </h3>
                      <p className="text-green-700">
                        {finalOutput.summary.estimatedTime}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800">
                        ต้นทุนที่ประมาณการ
                      </h3>
                      <p className="text-red-700">
                        {finalOutput.summary.estimatedCost}
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-pink-800">
                        ความเสี่ยง
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {finalOutput.summary.risks.map((risk, index) => (
                          <li key={index} className="text-pink-700 text-sm">
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleReset} variant="outline">
              เริ่มใหม่
            </Button>
            <Button
              onClick={() => onComplete?.(finalOutput)}
              className="flex-1"
            >
              ดาวน์โหลดผลลัพธ์
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading && !isAnalyzing && !isAssessingQuality && !isGeneratingFinal) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">กำลังประมวลผล...</h3>
          <p className="text-blue-700">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">เกิดข้อผิดพลาด</h3>
          <p className="text-red-700">{error}</p>
          <div className="flex space-x-2 mt-3">
            <Button onClick={clearError} variant="outline">
              ลองใหม่
            </Button>
            <Button onClick={handleReset}>เริ่มต้นใหม่</Button>
          </div>
        </div>
      </div>
    );
  }

  // Render based on current phase
  switch (currentPhase) {
    case "initial":
      return renderInitialPhase();
    case "questions":
      return renderQuestionsPhase();
    case "quality":
      return renderQualityPhase();
    case "complete":
      return renderCompletePhase();
    default:
      return renderInitialPhase();
  }
};
